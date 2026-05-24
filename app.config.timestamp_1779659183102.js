// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import tsr from "@tanstack/router-plugin/vite";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsr({
        routesDirectory: "./app/routes",
        generatedRouteTree: "./app/routeTree.gen.ts"
      })
    ]
  }
});
export {
  app_config_default as default
};
