from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    openapi_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/import")
async def import_graph(file: UploadFile = File(...)):
    raw_bytes = await file.read()
    text = raw_bytes.decode("utf-8")

    lines_with_numbers = [(i, line) for i, line in enumerate(text.splitlines(), start=1) if line.strip() and line.lstrip()[0] != '#']

    payload = {
        "nodes": [
            {
                "id": str(i),
                "type": "code",
                "position": {"x": (len(line) - len(line.lstrip())) / 4 * 25, "y": idx * 50},
                "data": {"label": line.lstrip()},
            }
            for idx, (i, line) in enumerate(lines_with_numbers)
        ],
        "edges": [
            {
                "id": f"{lines_with_numbers[i][0]}-{lines_with_numbers[i+1][0]}",
                "source": str(lines_with_numbers[i][0]),
                "target": str(lines_with_numbers[i+1][0]),
            }
            for i in range(len(lines_with_numbers) - 1)
        ],
    }
    
    from pprint import pprint; pprint(payload["nodes"])
    
    incoming_nodes = payload.get("nodes", [])
    incoming_edges = payload.get("edges", [])

    nodes = [
        {**n, "id": str(n["id"])}
        for n in incoming_nodes
    ]
    edges = [
        {**e, "id": str(e["id"])}
        for e in incoming_edges
    ]

    result = {
        "nodes": nodes,
        "edges": edges,
    }

    return JSONResponse(content=result)
