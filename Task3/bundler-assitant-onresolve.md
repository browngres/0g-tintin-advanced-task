Assistant



resolve fallback

---

Searched resolve fallback

Searched resolve fallback module resolution

Searched onResolve fallback plugin bundler
Based on the search results, I couldn't find specific documentation about "resolve fallback" in Bun. Let me provide you with what I found related to module resolution:

Module Resolution in Bun:

Bun uses its internal module resolution algorithm through Bun.resolveSync(). According to the Utils documentation, you can resolve file paths or module specifiers like this:
```ts
Bun.resolveSync("./foo.ts", "/path/to/project");
// => "/path/to/project/foo.ts"

Bun.resolveSync("zod", "/path/to/project");
// => "/path/to/project/node_modules/zod/index.ts"
```

Plugin Resolution:

In the bundler's plugin system, there's an onResolve hook that allows you to customize module resolution. From the Plugins documentation, you can intercept and modify how modules are resolved:
```ts
build.onResolve({ filter: /.*/, namespace: "file" }, args => {
  // Return a new path to redirect the import
  return {
    path: args.path.replace("images/", "./public/images/"),
  };
});
```