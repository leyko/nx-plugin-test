import { createRequire } from 'module';const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// apps/main/service-test1/cdk/src/apis/test1/healthz/get/handler.ts
var handler = /* @__PURE__ */ __name(async () => {
  return { statusCode: 200, body: JSON.stringify({ status: "OK" }) };
}, "handler");
export {
  handler
};
// itzworking.io
