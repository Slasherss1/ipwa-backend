import path from "path";
import nodeExternals from "webpack-node-externals";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

export default {
    entry: './src/index.ts',
    target: "node",
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin()
        ]
    },
    externalsPresets: {
        node: true
    },
    output: {
        path: path.resolve("dist"),
        filename: "ipwa-server.js"
    },
    mode: 'production',
    plugins: []
}