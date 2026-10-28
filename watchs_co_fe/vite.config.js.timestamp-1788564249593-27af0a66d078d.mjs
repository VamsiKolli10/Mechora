// vite.config.js
import { defineConfig } from "file:///sessions/rcw-015erezhz1tncvgjqrzudyyd/mnt/Mechora/watchs_co_fe/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/rcw-015erezhz1tncvgjqrzudyyd/mnt/Mechora/watchs_co_fe/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/sessions/rcw-015erezhz1tncvgjqrzudyyd/mnt/Mechora/watchs_co_fe";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled"
          ],
          "vendor-state": ["@reduxjs/toolkit", "react-redux", "axios"],
          "vendor-supabase": ["@supabase/supabase-js"]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcmN3LTAxNWVyZXpoejF0bmN2Z2pxcnp1ZHl5ZC9tbnQvTWVjaG9yYS93YXRjaHNfY29fZmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9yY3ctMDE1ZXJlemh6MXRuY3ZnanFyenVkeXlkL21udC9NZWNob3JhL3dhdGNoc19jb19mZS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvcmN3LTAxNWVyZXpoejF0bmN2Z2pxcnp1ZHl5ZC9tbnQvTWVjaG9yYS93YXRjaHNfY29fZmUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIFwidmVuZG9yLXJlYWN0XCI6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICBcInZlbmRvci1tdWlcIjogW1xuICAgICAgICAgICAgXCJAbXVpL21hdGVyaWFsXCIsXG4gICAgICAgICAgICBcIkBtdWkvaWNvbnMtbWF0ZXJpYWxcIixcbiAgICAgICAgICAgIFwiQGVtb3Rpb24vcmVhY3RcIixcbiAgICAgICAgICAgIFwiQGVtb3Rpb24vc3R5bGVkXCIsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBcInZlbmRvci1zdGF0ZVwiOiBbXCJAcmVkdXhqcy90b29sa2l0XCIsIFwicmVhY3QtcmVkdXhcIiwgXCJheGlvc1wiXSxcbiAgICAgICAgICBcInZlbmRvci1zdXBhYmFzZVwiOiBbXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgc2V0dXBGaWxlczogXCIuL3NyYy9zZXR1cFRlc3RzLmpzXCIsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1csU0FBUyxvQkFBb0I7QUFDNVksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxjQUFjO0FBQUEsWUFDWjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGdCQUFnQixDQUFDLG9CQUFvQixlQUFlLE9BQU87QUFBQSxVQUMzRCxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQSxRQUM3QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
