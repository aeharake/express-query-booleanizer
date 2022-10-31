import { describe, expect, test } from '@jest/globals';
import express, { Request, Response } from 'express';
import { booleanize, BooleanizeOptions } from '..';
import request from 'supertest';
let app;
beforeAll(() => {
    initExpressForAllBooleanQueries();
});
const booleanQueryParams = ["isNew", "hasSomeValue"];
const booleanQueryIOMap = {
    1: true,
    0: false,
    "-1": false,
    false: false,
    true: true,
    "something": "something",
    "_": "_"
}
const someOtherVals = ["userId", "authX", "x", "blabla"]
const stringQueryIOMap = {
    1: "1",
    0: "0",
    "-1": "-1",
    false: "false",
    true: "true",
    "something": "something",
    "_": "_"
}
describe(`Testing for ${booleanQueryParams.join(", ")}`, () => {
    booleanQueryParams.forEach((booleanQuery: any) => {
        describe(`Testing different input values for ${booleanQuery}`, () => {
            Object.keys(booleanQueryIOMap).forEach((value: any) => {
                test(`passing ${booleanQuery}=${value}`, async () => {
                    const response = (await request(app).get(`/test?${booleanQuery}=${value}`)).body;
                    expect(response[booleanQuery]).toBe(booleanQueryIOMap[value]);
                })
            })
        })
    })
})
describe(`Testing for ${booleanQueryParams.join(", ")} but this time middleware accepts only 'is' prefix`, () => {
    beforeAll(() => {
        initExpressForAllBooleanQueries({
            startingWith: ["is"]
        })
    })
    describe(`Testing different input values for isNew`, () => {
        Object.keys(booleanQueryIOMap).forEach((key: any) => {
            test(`passing isNew=${key}`, async () => {
                const response = (await request(app).get(`/test?isNew=${key}`)).body;
                expect(response["isNew"]).toBe(booleanQueryIOMap[key]);
            })
        })
    })
    describe(`Testing different input values for hasSomeVal`, () => {
        Object.keys(stringQueryIOMap).forEach((key: any) => {
            test(`passing hasSomeVal=${key}`, async () => {
                const response = (await request(app).get(`/test?hasSomeVal=${key}`)).body;
                expect(response["hasSomeVal"]).toBe(stringQueryIOMap[key]);
            })
        })
    })
})
describe("Testing values not starting with is or has", () => {
    someOtherVals.forEach((stringQuery: any) => {
        describe(`Testing different input values for ${stringQuery}`, () => {
            Object.keys(stringQueryIOMap).forEach((value: any) => {
                test(`passing ${stringQuery}=${value}`, async () => {
                    const response = (await request(app).get(`/test?${stringQuery}=${value}`)).body;
                    expect(response[stringQuery]).toBe(stringQueryIOMap[value]);
                })
            })
        })
    })
});
function initExpressForAllBooleanQueries(opts?: BooleanizeOptions) {
    app = express();
    app.use(booleanize(opts));
    app.get('/test', (req: Request, res: Response) => {
        res.json(req.query)
    })
}

