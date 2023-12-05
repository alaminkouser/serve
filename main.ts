const PORT = 8000;
const HOME = "./home";
const INDEX = true;

Deno.serve(
  { port: PORT, hostname: "0.0.0.0" },
  (request, _serveHandlerInfo) => {
    const PATH = HOME + decodeURIComponent(new URL(request.url).pathname);
    console.log(PATH);
    switch (request.method) {
      case "GET":
        if (PATH.endsWith("/")) {
          if (INDEX) {
            return Deno.readFile(PATH + "index.html")
              .then((value) => {
                return new Response(value);
              })
              .catch((value) => {
                return new Response(value, { status: 404 });
              });
          } else {
            return new Promise((resolve, reject) => {
              async function _readDir() {
                type Dir = {"ok": boolean, "entryList": Array<Deno.DirEntry>};
                const DIR: Dir = {"ok": false, "entryList": []};
                try {
                  for await (const entry of Deno.readDir(PATH)) {
                    DIR.entryList.push(entry);
                  }
                  DIR.ok = true;
                  return DIR;
                } catch (_) {
                  return DIR;
                }
              }
              _readDir().then((value) => {
                resolve(new Response(JSON.stringify(value)));
              }).catch((value) => {
                console.log(value);
                reject(new Response(value, { status: 404 }));
              });
            });
          }
        } else {
          return Deno.readFile(PATH)
            .then((value) => {
              return new Response(value);
            })
            .catch((value) => {
              return new Response(value, { status: 404 });
            });
        }
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  },
);
