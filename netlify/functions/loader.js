
const loader = `local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")
local StarterGui = game:GetService("StarterGui")
local GuiService = game:GetService("GuiService")

local device = "알 수 없는 기기"

if GuiService:IsTenFootInterface() then
    device = "콘솔"
elseif UserInputService.TouchEnabled then
    device = "모바일"
    if workspace.CurrentCamera and workspace.CurrentCamera.ViewportSize.X >= 1000 then
        device = "태블릿"
    end
elseif UserInputService.KeyboardEnabled then
    device = "컴퓨터"
end

task.spawn(function()
    for i = 1, 10 do
        local success = pcall(function()
            StarterGui:SetCore("SendNotification", {
                Title = "| 소직별 스크립트",
                Text = "[" .. device .. "]에서 실행중.",
                Duration = 5
            })
        end)

        if success then
            break
        end

        task.wait(0.5)
    end
end)

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
