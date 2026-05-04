const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Lead = require('../model/Lead');
const fs = require('fs')
const path = require('path')

describe('/POST /lead', () => {
    test('POST /api/lead should create a lead', async() => {
        const res = await request(app)
            .post('/api/lead')
            .attach('file', 'tests/files/test.csv')

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('name', 'test.csv')
        expect(res.body).toHaveProperty('location')
    })

    test('POST /api/lead should return 400 if no file uploaded', async() => {
        const res = await request(app)
            .post('/api/lead')

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('error', 'No file uploaded')
    })
})

describe('/GET /lead/:id', () => {
    test('GET /api/lead/:id should return a lead', async () => {
        const mockLead = await Lead.create({
            name: 'test.csv',
            location: 'files/test.csv'
        })

        const res = await request(app)
            .get(`/api/lead/${mockLead._id}`)

        expect(res.statusCode).toBe(200)
    })

    test('GET /api/lead/:id should return invalid lead error', async () => {
        const res = await request(app)
            .get('/api/lead/123')
        
        expect(res.statusCode).toBe(400)
    })

    test('GET /api/lead/:id should return 404 not found', async () => {
        const fakeId = new mongoose.Types.ObjectId()

        const res = await request(app)
            .get(`/api/lead/${fakeId}`)
        
        expect(res.statusCode).toBe(404)
    })
})

describe('/GET /leads', () => {
    test('/GET /api/leads -> should return something or empty', async () => {
        const res = await request(app)
            .get('/api/leads')

        expect(res.statusCode).toBe(200)
    })
})

describe('/DEL /lead/:id', () => {

    let leadId;
    let filePath;

    beforeEach(async () => {
        // upload a lead first
        const res = await request(app)
            .post('/api/lead')
            .attach('file', path.join(__dirname, 'files/test.csv'));

        leadId = res.body._id;
        filePath = res.body.location;
    });

    test('/DEL /api/lead/:id -> should return error', async () => {
        const res = await request(app)
            .delete('/api/lead/123')
        
        expect(res.statusCode).toBe(400)
    })

    test('/DEL /api/lead/:id -> should return 404', async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const res = await request(app)
            .delete(`/api/lead/${fakeId}`)
        
        expect(res.statusCode).toBe(404)
    })

    test('/DEL /api/lead/:id -> should delete the lead from db and file', async () => {
        const res = await request(app)
            .delete(`/api/lead/${leadId}`)
        
        expect(res.statusCode).toBe(200)
        expect(fs.existsSync(`tests/files/${filePath}`)).toBe(false)
    })
})