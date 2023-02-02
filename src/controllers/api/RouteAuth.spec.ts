import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "../../Server";

describe("AssetController route testing", () => {

    let request: SuperTest.SuperTest<SuperTest.Test>;
    beforeEach(PlatformTest.bootstrap(Server));

    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    //FindAll Route
    it("GET /api/asset", async () => {
        const response = await request.get("/api/asset").expect(401);

        expect(response.body).toEqual({
            errors: [],
            message: 'No token found in the request header',
            name: "UNAUTHORIZED",
            status: 401,
        });
    });

    //FindByID Route
    it("GET /api/asset/id", async () => {
        const response = await request.get("/api/asset/id").expect(401);

        expect(response.body).toEqual({
            errors: [],
            message: 'No token found in the request header',
            name: "UNAUTHORIZED",
            status: 401,
        });
    });

    //DownloadByID Route
    it("GET /api/asset/id/b", async () => {
        const response = await request.get("/api/asset/id/b").expect(401);

        expect(response.body).toEqual({
            errors: [],
            message: 'No token found in the request header',
            name: "UNAUTHORIZED",
            status: 401,
        });
    });
});