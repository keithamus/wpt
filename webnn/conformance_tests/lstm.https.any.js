// META: title=test WebNN API lstm operation
// META: global=window
// META: variant=?cpu
// META: variant=?gpu
// META: variant=?npu
// META: script=../resources/utils.js
// META: timeout=long

'use strict';

// https://www.w3.org/TR/webnn/#api-mlgraphbuilder-lstm
// Long Short-Term Memory [LSTM] recurrent network uses an input, output,
// forget, and cell gate to compute the output state that rolls into the output
// across the temporal sequence of the network.
// enum MLRecurrentNetworkDirection {
//   "forward",
//   "backward",
//   "both"
// };
//
// enum MLRecurrentNetworkActivation {
//   "relu",
//   "sigmoid",
//   "tanh"
// };
//
// enum MLLstmWeightLayout {
//   "iofg", // input-output-forget-cell gate ordering
//   "ifgo"  // input-forget-cell-output gate ordering
// };
//
// dictionary MLLstmOptions {
//   MLOperand bias;
//   MLOperand recurrentBias;
//   MLOperand peepholeWeight;
//   MLOperand initialHiddenState;
//   MLOperand initialCellState;
//   boolean returnSequence = false;
//   MLRecurrentNetworkDirection direction = "forward";
//   MLLstmWeightLayout layout = "iofg";
//   sequence<MLRecurrentNetworkActivation> activations;
// };
//
// sequence<MLOperand> lstm(MLOperand input,
//                          MLOperand weight,
//                          MLOperand recurrentWeight,
//                          [EnforceRange] unsigned long steps,
//                          [EnforceRange] unsigned long hiddenSize,
//                          optional MLLstmOptions options = {});


const getLstmPrecisionTolerance = (graphResources) => {
  const toleranceValueDict = {float32: 3, float16: 10};
  const expectedDataType =
      graphResources
          .expectedOutputs[Object.keys(graphResources.expectedOutputs)[0]]
          .descriptor.dataType;
  return {metricType: 'ULP', value: toleranceValueDict[expectedDataType]};
};

const lstmTests = [
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias and options.activations=['relu', 'relu', 'relu']",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.peepholeWeight",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.initialHiddenState",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'initialHiddenState': 'lstmInitialHiddenState',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.initialCellState",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'initialCellState': 'lstmInitialCellState',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.returnSequence=false",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': false,
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.returnSequence=true",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': true,
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput3': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.direction='forward'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'direction': 'forward',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.layout='iofg'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.layout='ifgo'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'layout': 'ifgo',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name': 'lstm float32 tensors steps=1 with all options',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float32'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'initialHiddenState': 'lstmInitialHiddenState',
              'initialCellState': 'lstmInitialCellState',
              'returnSequence': true,
              'direction': 'forward',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput3': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name':
        "lstm float32 tensors steps=2 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.direction='backward'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'direction': 'backward',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [
            10.469000816345215, 58.02900695800781, 74.52900695800781,
            518.948974609375
          ],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [
            5.510000228881836, 20.01000213623047, 19.110000610351564,
            75.20999908447266
          ],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name': 'lstm float32 tensors steps=2 with all options',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float32'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'initialHiddenState': 'lstmInitialHiddenState',
              'initialCellState': 'lstmInitialCellState',
              'returnSequence': true,
              'direction': 'backward',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [
            10.469000816345215, 58.02900695800781, 74.52900695800781,
            518.948974609375
          ],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [
            5.510000228881836, 20.01000213623047, 19.110000610351564,
            75.20999908447266
          ],
          'descriptor': {shape: [1, 2, 2], dataType: 'float32'}
        },
        'lstmOutput3': {
          'data': [
            10.469000816345215, 58.02900695800781, 74.52900695800781,
            518.948974609375, 1, 8, 1, 8
          ],
          'descriptor': {shape: [2, 1, 2, 2], dataType: 'float32'}
        }
      }
    }
  },
  {
    'name': 'lstm float32 tensors steps=2 with bidirections',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float32'}
        },
        'lstmWeight': {
          'data': [
            1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2,
            1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2
          ],
          'descriptor': {shape: [2, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [2, 8, 2], dataType: 'float32'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [2, 8], dataType: 'float32'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [2, 8], dataType: 'float32'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': true,
              'direction': 'both',
              'layout': 'iofg'
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [
            0.5764073133468628, 0.8236227035522461, 0.6612355709075928,
            0.8442635536193848, 0.5764073133468628, 0.8236227035522461,
            0.8635294437408447, 0.9491351246833801
          ],
          'descriptor': {shape: [2, 2, 2], dataType: 'float32'}
        },
        'lstmOutput2': {
          'data': [
            1.0171456336975098, 1.6205494403839111, 1.3388464450836182,
            1.7642604112625122, 1.0171456336975098, 1.6205494403839111,
            1.4856269359588623, 1.8449554443359375
          ],
          'descriptor': {shape: [2, 2, 2], dataType: 'float32'}
        },
        'lstmOutput3': {
          'data': [
            0.3696063756942749, 0.6082833409309387, 0.7037754058837891,
            0.7586681246757507, 0.5764073133468628, 0.8236227035522461,
            0.8635294437408447, 0.9491351246833801, 0.5764073133468628,
            0.8236227035522461, 0.6612355709075928, 0.8442635536193848,
            0.3696063756942749, 0.6082833409309387, 0.3696063756942749,
            0.6082833409309387
          ],
          'descriptor': {shape: [2, 2, 2, 2], dataType: 'float32'}
        }
      }
    }
  },

  // float16 tests
  {
    'name':
        'lstm float16 tensors steps=1 with options.bias, options.recurrentBias',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
            0.1, 0.1, 0.1
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': false,
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias and options.activations=['relu', 'relu', 'relu']",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.peepholeWeight",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.initialHiddenState",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'initialHiddenState': 'lstmInitialHiddenState',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.initialCellState",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'initialCellState': 'lstmInitialCellState',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.returnSequence=false",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': false,
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.returnSequence=true",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': true,
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput3': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.direction='forward'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'direction': 'forward',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and explicit options.layout='iofg'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=1 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.layout='ifgo'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'layout': 'ifgo',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name': 'lstm float16 tensors steps=1 with all options',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float16'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 1},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'initialHiddenState': 'lstmInitialHiddenState',
              'initialCellState': 'lstmInitialCellState',
              'returnSequence': true,
              'direction': 'forward',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [1, 4, 9, 36],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput3': {
          'data': [1, 8, 27, 216],
          'descriptor': {shape: [1, 1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name':
        "lstm float16 tensors steps=2 with options.bias, options.recurrentBias, options.activations=['relu', 'relu', 'relu'] and options.direction='backward'",
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'direction': 'backward',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [10.46875, 58.03125, 74.5, 519],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [5.5078125, 20.015625, 19.109375, 75.1875],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name': 'lstm float16 tensors steps=2 with all options',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [1, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [1, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmPeepholeWeight': {
          'data': [0, 0, 0, 0, 0, 0],
          'descriptor': {shape: [1, 6], dataType: 'float16'},
          'constant': true
        },
        'lstmInitialHiddenState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmInitialCellState': {
          'data': [0, 0, 0, 0],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'peepholeWeight': 'lstmPeepholeWeight',
              'initialHiddenState': 'lstmInitialHiddenState',
              'initialCellState': 'lstmInitialCellState',
              'returnSequence': true,
              'direction': 'backward',
              'layout': 'iofg',
              'activations': ['relu', 'relu', 'relu']
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [10.46875, 58.03125, 74.5, 519],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [5.5078125, 20.015625, 19.109375, 75.1875],
          'descriptor': {shape: [1, 2, 2], dataType: 'float16'}
        },
        'lstmOutput3': {
          'data': [10.46875, 58.03125, 74.5, 519, 1, 8, 1, 8],
          'descriptor': {shape: [2, 1, 2, 2], dataType: 'float16'}
        }
      }
    }
  },
  {
    'name': 'lstm float16 tensors steps=2 with bidirections',
    'graph': {
      'inputs': {
        'lstmInput': {
          'data': [1, 2, 2, 1, 3, 4, 1, 2],
          'descriptor': {shape: [2, 2, 2], dataType: 'float16'}
        },
        'lstmWeight': {
          'data': [
            1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2,
            1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2, 1, -1, 2, -2
          ],
          'descriptor': {shape: [2, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentWeight': {
          'data': [
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375,
            0.0999755859375, 0.0999755859375, 0.0999755859375, 0.0999755859375
          ],
          'descriptor': {shape: [2, 8, 2], dataType: 'float16'},
          'constant': true
        },
        'lstmBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [2, 8], dataType: 'float16'},
          'constant': true
        },
        'lstmRecurrentBias': {
          'data': [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          'descriptor': {shape: [2, 8], dataType: 'float16'},
          'constant': true
        }
      },
      'operators': [{
        'name': 'lstm',
        'arguments': [
          {'input': 'lstmInput'}, {'weight': 'lstmWeight'},
          {'recurrentWeight': 'lstmRecurrentWeight'}, {'steps': 2},
          {'hiddenSize': 2}, {
            'options': {
              'bias': 'lstmBias',
              'recurrentBias': 'lstmRecurrentBias',
              'returnSequence': true,
              'direction': 'both',
              'layout': 'iofg'
            }
          }
        ],
        'outputs': ['lstmOutput1', 'lstmOutput2', 'lstmOutput3']
      }],
      'expectedOutputs': {
        'lstmOutput1': {
          'data': [
            0.576171875, 0.82373046875, 0.6611328125, 0.84423828125,
            0.576171875, 0.82373046875, 0.86376953125, 0.94921875
          ],
          'descriptor': {shape: [2, 2, 2], dataType: 'float16'}
        },
        'lstmOutput2': {
          'data': [
            1.017578125, 1.6201171875, 1.3388671875, 1.7646484375, 1.017578125,
            1.6201171875, 1.4853515625, 1.8447265625
          ],
          'descriptor': {shape: [2, 2, 2], dataType: 'float16'}
        },
        'lstmOutput3': {
          'data': [
            0.36962890625, 0.6083984375, 0.70361328125, 0.7587890625,
            0.576171875, 0.82373046875, 0.86376953125, 0.94921875, 0.576171875,
            0.82373046875, 0.6611328125, 0.84423828125, 0.36962890625,
            0.6083984375, 0.36962890625, 0.6083984375
          ],
          'descriptor': {shape: [2, 2, 2, 2], dataType: 'float16'}
        }
      }
    }
  }
];

if (navigator.ml) {
  lstmTests.filter(isTargetTest).forEach((test) => {
    webnn_conformance_test(
        buildAndExecuteGraph, getLstmPrecisionTolerance, test);
  });
} else {
  test(() => assert_implements(navigator.ml, 'missing navigator.ml'));
}
