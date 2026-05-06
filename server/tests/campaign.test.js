const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
// require('dotenv').config();

const Campaign = require('../model/Campaign');
const { beforeEach } = require('node:test');

  // beforeAll(async () => {
  //   await mongoose.connect(process.env.MONGODB_URI_TEST);
  // });

  // afterAll(async () => {
  //   await mongoose.connection.close();
  // });
    

describe('/GET /campaign', () => {

    test('GET /api/campaigns should return something', async () => {
        const response = await request(app).get('/api/campaigns');

        expect(response.statusCode).toBe(200);
    })

    test('GET /api/campaign/:id -> invalid id returns 400', async () => {
      const res = await request(app)
        .get('/api/campaign/123')

        expect(res.statusCode).toBe(400)
    })

    test('GET /api/campaign/:id -> should return a campaign', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we"
      })
      const res = await request(app)
        .get(`/api/campaign/${mockCampaign._id}`)

        expect (res.statusCode).toBe(200)
    })
})

describe('/POST /campaign/', () => {
  let leadsIds = []

  beforeEach(async ()=> {
    //create 2 leads via file upload
    const res1 = await request(app)
      .post('/api/lead')
      .attach('file', 'tests/files/test.csv')

    const res2 = await request(app)
      .post('/api/lead')
      .attach('file', 'tests/files/test.csv')

    leadsIds = [res1.body._id, res2.body._id];
  })

  test('POST /api/campaign should create a campaign', async() => {
    const res = await request(app)
      .post('/api/campaign')
      .send({
          name:'Exhibition beyong the walls',
          description:'WE WILL KILL THEM TITANS',
          message: 'TATAKAEEEE',
          leads: leadsIds
      })

      expect(res.statusCode).toBe(201)
      expect(res.body.name).toBe('Exhibition beyong the walls')
  })
  
    test('POST /api/campaign should return 400 not an array', async() => {
      const res = await request(app)
        .post('/api/campaign')
        .send({
          name: 'LeadTest',
          description: 'just a test',
          message: 'yo yo yo',
          leads: leadsIds._id
        })

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe('Lead must be an array')
    })

    test('POST /api/campaign should return 400 Invalid lead id', async () => {
      const res = await request(app)
        .post('/api/campaign')
        .send({
          name: "lead test",
          description: "just testing",
          message: "yo yo you yo ",
          leads: ['123']
        })

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe('Invalid lead ID')
    })

    test('POST /api/campaign should return 404 lead not found', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app)
        .post('/api/campaign')
        .send({
          name: "lead test",
          description: "just testing",
          message: "yo yo you yo ",
          leads: [fakeId]
        })

        expect(res.statusCode).toBe(404)
        expect(res.body.error).toBe('One or more leads not found')
    })
})

describe('PUT /campaign/:id', () => {
     test('PUT /api/campaign/:id -> invalid id return 400', async () => {
      const res = await request(app)
        .put('/api/campaign/123')
      
        expect(res.statusCode).toBe(400)
    })

    test('PUT /api/campaign/:id  -> campaign not found 404', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .put(`/api/campaign/${fakeId}`)
        .send({
          name: "mock name"
        })
      expect(res.statusCode).toBe(404)
    })

    test('PUT /api/campaign/:id  -> update campaign 200', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we"
      })
      
      const res = await request(app)
        .put(`/api/campaign/${mockCampaign._id}`)
        .send({
          name: "updated name",
          description: "updated test desc",
          message: "updated message"
        })

      expect(res.statusCode).toBe(200)
    })

        test('PUT /api/campaign/:id  -> cannot update campaign when active 400', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we",
        status: "active"
      })
      
      const res = await request(app)
        .put(`/api/campaign/${mockCampaign._id}`)
        .send({
          name: "updated name",
          description: "updated test desc",
          message: "updated message"
        })

      expect(res.statusCode).toBe(400)
    })
})

describe('PATCH /campaign/:id/status', () => {
    //update campaign status
    test('PATCH /api/campaign/:id/status -> invalid id return 400', async () => {
      const res = await request(app)
        .patch('/api/campaign/123/status')
      
        expect(res.statusCode).toBe(400)
    })

    test('PATCH /api/campaign/:id/status  -> invalid status value 500', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we"
      })
      
      const res = await request(app)
        .patch(`/api/campaign/${mockCampaign._id}/status`)
        .send({
          status: "brrr..."
        })

      expect(res.statusCode).toBe(500)
    })

    test('PATCH /api/campaign/:id/status  -> campaign not found 404', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .patch(`/api/campaign/${fakeId}/status`)
      
      expect(res.statusCode).toBe(404)
    })

    test('PATCH /api/campaign/:id/status  -> activate campaign 200', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we"
      })
      
      const res = await request(app)
        .patch(`/api/campaign/${mockCampaign._id}/status`)
        .send({
          status: "active"
        })

      expect(res.statusCode).toBe(200)
    })

    test('PATCH /api/campaign/:id/status  -> activate 200', async () => {
      const mockCampaign = await Campaign.create({
        name: "mock test",
        description: "random test",
        message: "we we we"
      })
      
      const res = await request(app)
        .patch(`/api/campaign/${mockCampaign._id}/status`)
        .send({
          status: "inactive"
        })

      expect(res.statusCode).toBe(200)
    })
})