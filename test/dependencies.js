/**
 * For testing dependency resolution only.
 */

var resolve = require('..')

var join = require('path').join
var co = require('co')
var options = {}

function fixture(name) {
  return join(__dirname, 'fixtures', name)
}

describe('Dependencies', function () {
  before(function (done) {
    require('rimraf')(require('path').resolve('components'), done);
  })

  it('should resolve dependencies', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'component/classes': '1.1.4'
      }
    }, options);

    var classes = tree.dependencies['component/classes']
    classes.ref.should.equal('1.1.4')
    classes.version.should.equal('1.1.4')

    var indexof = classes.dependencies['component/indexof']
    indexof.should.be.ok
    indexof.dependents[0].should.equal(classes)
  }))

  it('should work with dev', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'component/classes': '1.1.4'
      },
      development: {
        dependencies: {
          'component/emitter': '1.1.1'
        }
      }
    }, {
      development: true
    });

    tree.dependencies['component/classes'].should.be.ok
    tree.dependencies['component/emitter'].should.be.ok
  }))

  // needs a better name!
  it('should recursively support semver', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'component/classes': '1.1.4',
        'component/indexof': "0.0.1"
      }
    }, options);

    var classes = tree.dependencies['component/classes']
    classes.ref.should.equal('1.1.4')
    classes.version.should.equal('1.1.4')

    var indexof = classes.dependencies['component/indexof']
    indexof.ref.should.equal('0.0.1')
    indexof.version.should.equal('0.0.1')

    tree.dependencies['component/indexof'].should.equal(indexof)

    indexof.dependents.length.should.equal(2);
  }))

  it('should work with semver', co(function* (){
    var tree = yield* resolve({
      dependencies: {
        'component/emitter': '> 1.1.0 < 1.1.2'
      }
    }, options);

    var emitter = tree.dependencies['component/emitter']
    emitter.ref.should.equal('1.1.1')
    emitter.version.should.equal('1.1.1')
  }))

  it('should work with as versions with tags with v\'s', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'suitcss/flex-embed': '1.0.0'
      }
    }, options);

    var embed = tree.dependencies['suitcss/flex-embed']
    embed.ref.should.equal('v1.0.0')
    embed.version.should.equal('1.0.0')
  }))

  it('should work with jonathanong/horizontal-grid-packing', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'jonathanong/horizontal-grid-packing': '<= 0.1.4'
      }
    }, options);

    var hgp = tree.dependencies['jonathanong/horizontal-grid-packing']
    hgp.version.should.equal('0.1.4')

    var part = hgp.dependencies['the-swerve/linear-partitioning']
    part.should.be.ok
    part.dependents.should.include(hgp)

    hgp.dependencies['component/classes'].should.be.ok
  }))

  it('should work with component/levenshtein', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'component/levenshtein': '*'
      }
    })

    tree.dependencies['component/levenshtein'].should.be.ok
  }))

  it('should work with ianstormtaylor/router', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'ianstormtaylor/router': '*'
      }
    })

    tree.dependencies['ianstormtaylor/router'].should.be.ok
  }))

  it('should resolve multiple nested semver deps', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'yields/select': '0.5.1',
        'component/pillbox': '1.3.1'
      }
    }, options);
  }))

  it('should resolve mixed-case deps', co(function* () {
    var tree = yield* resolve({
      dependencies: {
        'visionmedia/superagent': '0.16.0'
      }
    }, options);

    var deps = tree.dependencies['visionmedia/superagent'].dependencies
    deps.should.not.have.property('RedVentures/reduce')
    deps['redventures/reduce'].type.should.equal('dependency')
  }))

  it('should resolve component-process#11', co(function* () {
    var tree = yield* resolve(fixture('remoe-process-11'))
  }))
})
