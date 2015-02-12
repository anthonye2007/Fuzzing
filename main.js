var test = require('tap').test,
    Random = require('random-js')
    marqdown = require('./marqdown.js'),
    fs = require('fs'),
    stackTrace = require('stacktrace-parser')
    ;

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            var array = val.split('');

            if( fuzzer.random.bool(0.05) )
            {
                // REVERSE
        		array.reverse();
            }

            if (fuzzer.random.bool(0.25)) {
                // remove random number of chars at random location
                var numCharsToRemove = 5;
                var startLocation = 20;
                array.splice(numCharsToRemove, startLocation);
                console.log('removed chars');
            }

            return array.join('');
        }
    }
};

fuzzer.seed(0);

var failedTests = [];
var reducedTests = [];
var passedTests = 0;

function mutationTesting()
{
        var markDownTest = fs.readFileSync('test.md','utf-8');
        var markDownSimple = fs.readFileSync('simple.md','utf-8');

    for (var i = 0; i < 1000; i++) {

        if (fuzzer.random.bool(0.5)) {
            var markDown = markDownTest;
        } else {
            var markDown = markDownSimple;
        }

        var mutuatedString = fuzzer.mutate.string(markDown);

        try
        {
            marqdown.render(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }

    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber );
    }

    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );

}

mutationTesting();

//test('markedMutation', function(t) {
//
//});


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
