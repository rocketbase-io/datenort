import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { AssetController } from "./AssetController";

describe("AssetController route testing", () => {

    let request: SuperTest.SuperTest<SuperTest.Test>;
    beforeEach(PlatformTest.bootstrap(AssetController));

    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(PlatformTest.reset);

    it("GET /api/asset", async () => {
        const response = await request.get("/api").expect(404);

        expect(response.body).toEqual({
            errors: [],
            message: 'No token found in the request header',
            name: "UNAUTHORIZED",
            status: 401,
        });
    });
});