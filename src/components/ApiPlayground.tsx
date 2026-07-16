import React, { useState } from "react";
import { Terminal, Send, Copy, Check, Info, Server, HelpCircle, Code } from "lucide-react";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  category: "Movies" | "Ratings" | "Social" | "Analytics";
  queryParams?: { name: string; type: string; desc: string; defaultValue?: string; sampleValue?: string }[];
  bodyParams?: { name: string; type: string; required: boolean; desc: string; sampleValue?: any }[];
  curlExample: string;
  liveUrl: string;
}

export default function ApiPlayground() {
  const [activeEndpointIdx, setActiveEndpointIdx] = useState<number>(0);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>("");
  const [customParams, setCustomParams] = useState<{ [key: string]: string }>({});
  const [customBody, setCustomBody] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/movies",
      description: "Get all movies. Supports search querying, genre filtering, and alphabetical, rating, or release year sorting.",
      category: "Movies",
      queryParams: [
        { name: "q", type: "string", desc: "Keyword search matches title, director, and synopsis", sampleValue: "Nolan" },
        { name: "genre", type: "string", desc: "Filter by exact genre (e.g., Sci-Fi, Action, Drama)", sampleValue: "Sci-Fi" },
        { name: "sort", type: "string", desc: "Sorting criteria: 'rating', 'year', 'title'", sampleValue: "rating" }
      ],
      curlExample: "curl -X GET \"https://your-app-url.com/api/movies?q=Nolan&genre=Sci-Fi&sort=rating\"",
      liveUrl: "/api/movies"
    },
    {
      method: "GET",
      path: "/api/movies/top-rated",
      description: "Get list of top-rated movies, sorted by calculated average user ratings.",
      category: "Movies",
      queryParams: [
        { name: "limit", type: "number", desc: "Max number of items to return", defaultValue: "4", sampleValue: "3" }
      ],
      curlExample: "curl -X GET \"https://your-app-url.com/api/movies/top-rated?limit=3\"",
      liveUrl: "/api/movies/top-rated"
    },
    {
      method: "GET",
      path: "/api/movies/m-1",
      description: "Retrieve complete structural details, user ratings list, and synopsis of a specific movie by ID.",
      category: "Movies",
      curlExample: "curl -X GET \"https://your-app-url.com/api/movies/m-1\"",
      liveUrl: "/api/movies/m-1"
    },
    {
      method: "POST",
      path: "/api/movies",
      description: "Add a new movie to the shared cloud database. Syntactic and Semantic validations protect fields.",
      category: "Movies",
      bodyParams: [
        { name: "title", type: "string", required: true, desc: "Title of the movie", sampleValue: "Dune: Part Two" },
        { name: "director", type: "string", required: true, desc: "Director of the film", sampleValue: "Denis Villeneuve" },
        { name: "year", type: "number", required: true, desc: "Release year (1888 - present)", sampleValue: 2024 },
        { name: "genre", type: "string", required: true, desc: "Genre categorization", sampleValue: "Sci-Fi" },
        { name: "synopsis", type: "string", required: true, desc: "Extended cinematic plot synopsis", sampleValue: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family." },
        { name: "duration", type: "number", required: true, desc: "Length of film in minutes", sampleValue: 166 },
        { name: "imageUrl", type: "string", required: false, desc: "Poster image Unsplash URL" }
      ],
      curlExample: `curl -X POST -H "Content-Type: application/json" -d '{\n  "title": "Dune: Part Two",\n  "director": "Denis Villeneuve",\n  "year": 2024,\n  "genre": "Sci-Fi",\n  "synopsis": "Paul Atreides unites with Chani...",\n  "duration": 166\n}' "https://your-app-url.com/api/movies"`,
      liveUrl: "/api/movies"
    },
    {
      method: "POST",
      path: "/api/movies/m-1/rate",
      description: "Submit a new score or edit your previous score (1-5 stars) and write comments.",
      category: "Ratings",
      bodyParams: [
        { name: "userId", type: "string", required: true, desc: "ID of user (keeps persistence)", sampleValue: "u-sys" },
        { name: "username", type: "string", required: true, desc: "Username for social displaying", sampleValue: "CinematicGamer" },
        { name: "rating", type: "number", required: true, desc: "Integer score between 1 and 5", sampleValue: 5 },
        { name: "comment", type: "string", required: false, desc: "Text review comment", sampleValue: "Absolutely breathtaking!" }
      ],
      curlExample: `curl -X POST -H "Content-Type: application/json" -d '{\n  "userId": "u-sys",\n  "username": "CinematicGamer",\n  "rating": 5,\n  "comment": "Masterclass!"\n}' "https://your-app-url.com/api/movies/m-1/rate"`,
      liveUrl: "/api/movies/m-1/rate"
    },
    {
      method: "GET",
      path: "/api/analytics",
      description: "Fetch comprehensive statistical metrics including total movies, average rating score, popular search logs, and saved watchlists.",
      category: "Analytics",
      curlExample: "curl -X GET \"https://your-app-url.com/api/analytics\"",
      liveUrl: "/api/analytics"
    }
  ];

  const activeEp = endpoints[activeEndpointIdx];

  // Initialize helper values on tab switch
  React.useEffect(() => {
    setResponseJson(null);
    setResponseStatus(null);
    setResponseStatusText("");
    
    // Set default values for query params
    const initialParams: { [key: string]: string } = {};
    if (activeEp.queryParams) {
      activeEp.queryParams.forEach((qp) => {
        initialParams[qp.name] = qp.sampleValue || qp.defaultValue || "";
      });
    }
    setCustomParams(initialParams);

    // Set default body payload if POST
    if (activeEp.method === "POST" && activeEp.bodyParams) {
      const bodyObj: { [key: string]: any } = {};
      activeEp.bodyParams.forEach((bp) => {
        bodyObj[bp.name] = bp.sampleValue !== undefined ? bp.sampleValue : "";
      });
      setCustomBody(JSON.stringify(bodyObj, null, 2));
    } else {
      setCustomBody("");
    }
  }, [activeEndpointIdx]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeEp.curlExample);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setResponseJson(null);
    setResponseStatus(null);

    // Build query path
    let url = activeEp.liveUrl;
    if (activeEp.method === "GET" && activeEp.queryParams) {
      const qString = Object.keys(customParams)
        .filter((key) => customParams[key])
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(customParams[key])}`)
        .join("&");
      if (qString) {
        url = `${url}?${qString}`;
      }
    }

    try {
      const options: RequestInit = {
        method: activeEp.method,
        headers: {
          "Content-Type": "application/json"
        }
      };

      if (activeEp.method === "POST") {
        options.body = customBody;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText);

      const json = await res.json();
      setResponseJson(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseStatusText("Internal Client Error");
      setResponseJson({ error: "Client-side Connection Error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      
      {/* Sidebar - list of endpoints */}
      <div className="xl:col-span-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2 p-1">
          <Server className="h-5 w-5 text-orange-500" />
          <h2 className="font-sans text-base font-bold text-white uppercase tracking-wider">REST API Docs</h2>
        </div>

        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          {endpoints.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => setActiveEndpointIdx(idx)}
              className={`w-full rounded-xl border p-3 text-left transition-all flex items-start gap-2.5 ${
                activeEndpointIdx === idx
                  ? "border-orange-600 bg-orange-600/5"
                  : "border-white/10 bg-[#0a0a0a]/30 hover:bg-[#0a0a0a]/50 hover:border-white/20"
              }`}
            >
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold shrink-0 ${
                  ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                }`}
              >
                {ep.method}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-xs text-gray-200 font-medium truncate">{ep.path}</p>
                <p className="font-sans text-[11px] text-gray-500 line-clamp-1 mt-0.5">{ep.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Validation reminder */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold mb-1 uppercase tracking-wider">
            <Info className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Built-in Gatekeeper Rules</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-sans text-[11px] text-gray-400 mt-1.5">
            <li><span className="text-orange-500 font-semibold">Syntactic:</span> Malformed JSON throws a standard <span className="font-mono text-orange-400 bg-black/40 px-1 rounded">400 Bad Request</span>.</li>
            <li><span className="text-orange-500 font-semibold">Semantic:</span> Duplicate titles or ratings outside 1-5 throws a <span className="font-mono text-orange-400 bg-black/40 px-1 rounded">409 Conflict</span> or <span className="font-mono text-orange-400 bg-black/40 px-1 rounded">400</span>.</li>
          </ul>
        </div>
      </div>

      {/* Main Sandbox - Sandbox terminal & params controller */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/40 p-5 backdrop-blur-sm">
          
          {/* Header block */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                    activeEp.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                  }`}
                >
                  {activeEp.method}
                </span>
                <span className="font-mono text-sm font-semibold text-white">{activeEp.path}</span>
              </div>
              <p className="font-sans text-xs text-gray-400 mt-1 leading-normal">
                {activeEp.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-wider"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-orange-500" />}
              <span>{isCopied ? "Copied" : "Copy cURL"}</span>
            </button>
          </div>

          {/* Setup controller params/body */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Parameters column */}
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                {activeEp.method === "GET" ? "Query Parameters" : "Request Headers"}
              </h3>
              
              {activeEp.method === "GET" && activeEp.queryParams ? (
                <div className="flex flex-col gap-2.5">
                  {activeEp.queryParams.map((qp) => (
                    <div key={qp.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-orange-500 font-semibold">{qp.name}</span>
                        <span className="text-gray-500">{qp.type}</span>
                      </div>
                      <input
                        type="text"
                        value={customParams[qp.name] || ""}
                        onChange={(e) => setCustomParams({ ...customParams, [qp.name]: e.target.value })}
                        placeholder={qp.desc}
                        className="rounded-lg border border-white/10 bg-[#050505] px-2.5 py-1 text-xs text-gray-100 placeholder-gray-700 focus:outline-none focus:border-orange-500/30"
                      />
                    </div>
                  ))}
                </div>
              ) : activeEp.method === "POST" ? (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex flex-col gap-2 text-xs text-gray-400 font-sans">
                  <div className="flex justify-between font-mono text-[11px] border-b border-white/10 pb-1.5">
                    <span>Content-Type</span>
                    <span className="text-gray-300">application/json</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Accept</span>
                    <span className="text-gray-300">application/json</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Body payload on the right requires exact schema formatting to pass semantic filters.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No parameters required for this endpoint.</p>
              )}
            </div>

            {/* Body payload JSON editor */}
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                {activeEp.method === "POST" ? "Request Body Payload" : "Live Endpoint URL"}
              </h3>

              {activeEp.method === "POST" ? (
                <textarea
                  rows={6}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050505] px-3 py-2 font-mono text-xs text-orange-400/90 focus:outline-none focus:border-orange-500/40"
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-gray-400 select-all truncate">
                  {window.location.origin}{activeEp.liveUrl}
                </div>
              )}
            </div>

          </div>

          {/* Trigger button */}
          <button
            onClick={executeRequest}
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isLoading ? "Executing Request..." : "Test Request (Send Live HTTP)"}</span>
          </button>

        </div>

        {/* Sandbox Live output Terminal */}
        <div className="rounded-2xl border border-white/10 bg-black p-4 font-mono text-xs flex flex-col gap-2 min-h-[220px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Terminal className="h-4 w-4 text-orange-500" />
              <span>Sandbox Console Output</span>
            </div>
            {responseStatus && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "text-emerald-400"
                      : responseStatus >= 400
                      ? "text-rose-400"
                      : "text-orange-500"
                  }`}
                >
                  {responseStatus} {responseStatusText}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-x-auto max-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[160px]">
                <span className="animate-pulse text-gray-500 text-xs">Waiting for server response...</span>
              </div>
            ) : responseJson ? (
              <pre className="text-left text-orange-400/90 whitespace-pre leading-normal overflow-auto p-1 text-[11px]">
                {JSON.stringify(responseJson, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] text-center text-gray-600 gap-1 font-sans">
                <Code className="h-6 w-6 text-gray-750" />
                <p className="text-xs">Console is clean.</p>
                <p className="text-[10px]">Click "Test Request" above to execute this endpoint against the server.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
