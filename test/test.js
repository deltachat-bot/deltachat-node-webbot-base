process.env.NODE_ENV = 'test'

const http = require('http')
const chai = require('chai')
const should = chai.should()
chai.use(require('chai-http'))

const app = require('../src/web_app')
const deltachat = require('../src/deltachat')
const server = require('http').createServer(app)

describe("HTTP request ", () => {
  before(function() {
    // Return the promise so mocha waits for it.
    return deltachat.start()
  })

  it('to / should respond with code 404', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        should.not.exist(err)
        res.should.have.status(404)
        done()
      })
  })

  it('to /checkStatus should respond with code 401', (done) => {
    chai.request(server)
      .get('/checkStatus')
      .end((err, res) => {
        should.not.exist(err)
        res.should.have.status(401)
        done()
      })
  })

  it('to /requestQR should respond with a proper JSON object', (done) => {
    chai.request(server)
      .get('/requestQR')
      .end((err, res) => {
        should.not.exist(err)
        res.status.should.equal(200)
        Object.keys(res.body).should.eql(['qr_code_data_url', 'qr_data'])
        res.body.qr_code_data_url.should.match(/^data:image\/png;base64,.*/)
        res.body.qr_data.should.include('OPENPGP4FPR:')
        res.body.qr_data.should.include('g=LoginBot%20group%20')
        done()
      })
  })

  it('to /styles.css should respond with the stylesheet', (done) => {
    chai.request(server)
      .get('/styles.css')
      .end((err, res) => {
        should.not.exist(err)
        res.status.should.equal(200)
        res.headers['content-type'].should.include('text/css')
        res.text.length.should.be > 100
        done()
      })
  })
})

