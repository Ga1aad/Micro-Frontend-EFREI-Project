const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: false,
    liveReload: false,
  },
  output: {
    publicPath: "http://localhost:3000/",
    clean: true,
  },
  resolve: { extensions: [".js", ".jsx"] },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]],
          },
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        mfeProduct: "mfeProduct@http://localhost:3001/remoteEntry.js",
        mfeCart: "mfeCart@http://localhost:3002/remoteEntry.js",
        mfeReco: "mfeReco@http://localhost:3003/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react, eager: false },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"], eager: false },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],
};
