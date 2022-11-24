import { PlatformTest } from "@tsed/common";
import { JwksService } from "./JwksService";

describe("JwkService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<JwksService>(JwksService);
    // const instance = PlatformTest.invoke<JwksService>(JwksService); // get fresh instance

    expect(instance).toBeInstanceOf(JwksService);
  });
});
