/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const PSP_WORKER_LOADER = require.resolve("./src/js/psp-worker-loader");
const WASM_LOADER = require.resolve("./src/js/wasm-loader.js");
const PSP_WORKER_COMPILER_LOADER = require.resolve("./src/js/psp-worker-compiler-loader.js");

class PerspectiveWebpackPlugin {
    constructor(options = {}) {
        this.options = Object.assign(
            {},
            {
                load_path: [__dirname.replace("-webpack-plugin", "")],
                workerLoaderOptions: {
                    name: "[name].worker.js"
                },
                wasmLoaderOptions: {
                    name: "[name]"
                }
            },
            options
        );
    }

    apply(compiler) {
        const rules = [
            {
                test: /\.less$/,
                exclude: /themes/,
                include: this.options.load_path,
                use: [{loader: "css-loader"}, {loader: "clean-css-loader", options: {level: 2}}, {loader: "less-loader"}]
            },
            {
                test: /\.(html)$/,
                include: this.options.load_path,
                use: {
                    loader: "html-loader",
                    options: {}
                }
            },
            {
                test: /\.(arrow)$/,
                include: this.options.load_path,
                use: {
                    loader: "arraybuffer-loader",
                    options: {}
                }
            }
        ];

        if (this.options.build_worker) {
            rules.push({
                test: /perspective\.(asmjs|wasm)\.js$/,
                include: this.options.load_path,
                use: [
                    {
                        loader: PSP_WORKER_LOADER,
                        options: Object.assign({}, this.options.workerLoaderOptions, {compiled: true})
                    },
                    {
                        loader: PSP_WORKER_COMPILER_LOADER,
                        options: {name: "[name].worker.js"}
                    }
                ]
            });
        } else {
            rules.push({
                test: /perspective\.(wasm|asmjs)\.js$/,
                include: this.options.load_path,
                use: {
                    loader: PSP_WORKER_LOADER,
                    options: this.options.workerLoaderOptions
                }
            });
        }

        rules.push({
            test: /\.js$/,
            include: this.options.load_path,
            loader: "source-map-loader"
        });

        // FIXME Workaround for performance regression in @apache-arrow 4.0
        rules.push({
            test: /\.js$/,
            include: /\@apache-arrow[/\\]es5-esm/,
            use: [
                {loader: "source-map-loader"},
                {
                    loader: "string-replace-loader",
                    options: {
                        search: "BaseVector.prototype[Symbol.isConcatSpreadable] = true;",
                        replace: ""
                    }
                }
            ]
        });

        rules.push({
            test: /psp\.(sync|async)\.wasm\.js$/,
            include: this.options.load_path,
            use: {
                loader: WASM_LOADER,
                options: this.options.wasmLoaderOptions
            }
        });

        const compilerOptions = compiler.options;
        const moduleOptions = compilerOptions.module || (compilerOptions.module = {});
        moduleOptions.rules = (moduleOptions.rules || []).concat(rules);
    }
}

module.exports = PerspectiveWebpackPlugin;
