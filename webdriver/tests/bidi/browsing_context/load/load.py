import pytest

from webdriver.bidi.modules.script import ContextTarget
from webdriver.error import TimeoutException

from tests.bidi import wait_for_bidi_events
from ... import int_interval
from .. import assert_navigation_info

pytestmark = pytest.mark.asyncio

CONTEXT_LOAD_EVENT = "browsingContext.load"


async def test_unsubscribe(bidi_session, inline, new_tab):
    await bidi_session.session.subscribe(events=[CONTEXT_LOAD_EVENT])
    await bidi_session.session.unsubscribe(events=[CONTEXT_LOAD_EVENT])

    # Track all received browsingContext.load events in the events array
    events = []

    async def on_event(method, data):
        events.append(data)

    remove_listener = bidi_session.add_event_listener(CONTEXT_LOAD_EVENT, on_event)

    url = inline("<div>foo</div>")
    await bidi_session.browsing_context.navigate(
        context=new_tab["context"], url=url, wait="complete"
    )

    with pytest.raises(TimeoutException):
        await wait_for_bidi_events(bidi_session, events, 1, timeout=0.5)

    remove_listener()


async def test_subscribe(
    bidi_session, subscribe_events, inline, new_tab, wait_for_event, wait_for_future_safe
):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    on_entry = wait_for_event(CONTEXT_LOAD_EVENT)
    url = inline("<div>foo</div>")
    await bidi_session.browsing_context.navigate(context=new_tab["context"], url=url)
    event = await wait_for_future_safe(on_entry)

    assert_navigation_info(event, {"context": new_tab["context"], "url": url})


async def test_timestamp(
    bidi_session, current_time, subscribe_events, inline, new_tab, wait_for_event, wait_for_future_safe
):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    time_start = await current_time()

    on_entry = wait_for_event(CONTEXT_LOAD_EVENT)
    url = inline("<div>foo</div>")
    result = await bidi_session.browsing_context.navigate(
        context=new_tab["context"], url=url
    )
    event = await wait_for_future_safe(on_entry)

    time_end = await current_time()

    assert_navigation_info(
        event,
        {
            "context": new_tab["context"],
            "navigation": result["navigation"],
            "timestamp": int_interval(time_start, time_end),
        },
    )


async def test_iframe(
    bidi_session, subscribe_events, new_tab, test_page, test_page_same_origin_frame
):
    events = []

    async def on_event(method, data):
        events.append(data)

    remove_listener = bidi_session.add_event_listener(CONTEXT_LOAD_EVENT, on_event)
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    result = await bidi_session.browsing_context.navigate(
        context=new_tab["context"], url=test_page_same_origin_frame
    )

    await wait_for_bidi_events(bidi_session, events, 2)

    contexts = await bidi_session.browsing_context.get_tree(root=new_tab["context"])

    assert len(contexts) == 1
    root_info = contexts[0]
    assert len(root_info["children"]) == 1
    child_info = root_info["children"][0]

    # First load event comes from iframe
    assert_navigation_info(
        events[0], {"context": child_info["context"], "url": test_page}
    )
    assert_navigation_info(
        events[1],
        {
            "context": root_info["context"],
            "navigation": result["navigation"],
            "url": test_page_same_origin_frame,
        },
    )

    assert events[0]["navigation"] is not None
    assert events[0]["navigation"] != events[1]["navigation"]

    remove_listener()


@pytest.mark.parametrize("type_hint", ["tab", "window"])
async def test_new_context_not_emitted(bidi_session, subscribe_events,
      wait_for_event, wait_for_future_safe, type_hint):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    # Track all received "browsingContext.load" events in the events array
    events = []

    async def on_event(method, data):
        events.append(data)

    remove_listener = bidi_session.add_event_listener(
        CONTEXT_LOAD_EVENT, on_event
    )

    await bidi_session.browsing_context.create(type_hint=type_hint)

    with pytest.raises(TimeoutException):
        await wait_for_bidi_events(bidi_session, events, 1, timeout=0.5)

    remove_listener()


@pytest.mark.parametrize("sandbox", [None, "sandbox_1"])
async def test_document_write(
    bidi_session, subscribe_events, new_tab, wait_for_event, wait_for_future_safe, sandbox
):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    on_entry = wait_for_event(CONTEXT_LOAD_EVENT)

    await bidi_session.script.evaluate(
        expression="""document.open(); document.write("<h1>Replaced</h1>"); document.close();""",
        target=ContextTarget(new_tab["context"], sandbox),
        await_promise=False,
    )

    event = await wait_for_future_safe(on_entry)

    assert_navigation_info(
        event,
        {"context": new_tab["context"]},
    )
    assert event["navigation"] is not None


async def test_early_same_document_navigation(
    bidi_session, subscribe_events, inline, new_tab, wait_for_event, wait_for_future_safe
):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    on_entry = wait_for_event(CONTEXT_LOAD_EVENT)

    url = inline("""
        <script type="text/javascript">
            history.replaceState(null, 'initial', window.location.href);
        </script>
    """)

    result = await bidi_session.browsing_context.navigate(
        context=new_tab["context"], url=url
    )

    event = await wait_for_future_safe(on_entry)

    assert_navigation_info(
        event,
        {"context": new_tab["context"], "navigation": result["navigation"], "url": url},
    )


async def test_page_with_base_tag(
    bidi_session, subscribe_events, inline, new_tab, wait_for_event, wait_for_future_safe
):
    await subscribe_events(events=[CONTEXT_LOAD_EVENT])

    on_entry = wait_for_event(CONTEXT_LOAD_EVENT)
    url = inline("""<base href="/relative-path">""")
    result = await bidi_session.browsing_context.navigate(
        context=new_tab["context"], url=url
    )
    event = await wait_for_future_safe(on_entry)

    assert_navigation_info(
        event,
        {"context": new_tab["context"], "navigation": result["navigation"], "url": url},
    )
