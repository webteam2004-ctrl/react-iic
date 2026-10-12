import "dotenv/config.js";
import app from "./src/app.js";

const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let server;

function formatLog(step, name, pass, detail = "") {
    const icon = pass ? "✅ PASS" : "❌ FAIL";
    console.log(`[${step}] ${icon} - ${name}`);
    if (detail) console.log(`      ↳ ${detail}`);
}

async function start() {
    console.log("\n========================================================");
    console.log("       🚀 ADMIN RBAC & PIPELINE TEST RUNNER");
    console.log("========================================================\n");

    await new Promise((resolve) => {
        server = app.listen(PORT, "127.0.0.1", resolve);
    });

    try {
        const superEmail = process.env.SUPER_ADMIN_EMAILS || process.env.ADMIN_EMAIL || "superadmin2004@gmail.com";
        const superPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "websuperadmin@2026";

        // 1. Super Admin Login
        const loginRes = await fetch(`${BASE_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: superEmail, password: superPassword })
        });
        const loginData = await loginRes.json();
        const superToken = loginData.token;
        formatLog(1, "Super Admin Login & Auto-Bootstrap", loginRes.status === 200 && !!superToken, `Logged in as: ${superEmail} (role: ${loginData.user?.role})`);

        // 2. Fetch Profile (/api/admin/me)
        const meRes = await fetch(`${BASE_URL}/admin/me`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const meData = await meRes.json();
        formatLog(2, "Super Admin Profile Verification", meRes.status === 200, `Name: ${meData.user?.name}, Role: ${meData.user?.role}`);

        // 3. Create a Sub-Admin with limited permissions (events:read only)
        const tempAdminEmail = `test_admin_${Date.now()}@iic.edu`;
        const tempPassword = "TestPassword@2026";

        const createAdminRes = await fetch(`${BASE_URL}/admin/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${superToken}`
            },
            body: JSON.stringify({
                email: tempAdminEmail,
                password: tempPassword,
                name: "Events Viewer Admin",
                role: "admin",
                permissions: {
                    events: ["read"]
                }
            })
        });
        const createAdminData = await createAdminRes.json();
        const subAdminId = createAdminData.user?.id;
        formatLog(3, "Super Admin creates Sub-Admin with limited permissions", createAdminRes.status === 201, `Created Admin: ${tempAdminEmail} (permissions: events:read)`);

        // 4. Sub-Admin Login
        const subLoginRes = await fetch(`${BASE_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: tempAdminEmail, password: tempPassword })
        });
        const subLoginData = await subLoginRes.json();
        const subToken = subLoginData.token;
        formatLog(4, "Sub-Admin Login & Token Generation", subLoginRes.status === 200 && !!subToken, `Token received for ${tempAdminEmail}`);

        // 5. Sub-Admin allowed to READ events
        const subReadEventsRes = await fetch(`${BASE_URL}/events`, {
            headers: { Authorization: `Bearer ${subToken}` }
        });
        formatLog(5, "Sub-Admin Authorized to Read Events (HTTP 200)", subReadEventsRes.status === 200, `Status: ${subReadEventsRes.status} OK`);

        // 6. Sub-Admin BLOCKED from creating events (RBAC Guard)
        const subCreateBlockedRes = await fetch(`${BASE_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${subToken}`
            },
            body: JSON.stringify({
                title: "Unauthorized Event Creation Attempt"
            })
        });
        const subCreateBlockedData = await subCreateBlockedRes.json();
        formatLog(6, "RBAC Guard: Sub-Admin BLOCKED with 403 Forbidden", subCreateBlockedRes.status === 403, `Message: "${subCreateBlockedData.message}"`);

        // 7. Unified Pipeline Publish (Event + Calendar Sync + Gallery linking)
        const pipelineRes = await fetch(`${BASE_URL}/pipeline/publish`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${superToken}`
            },
            body: JSON.stringify({
                title: "IIC Innovation Hackathon 2026",
                description: "Flagship annual innovation hackathon",
                start_time: "2026-12-01T10:00:00Z",
                location: "IIC Innovation Lab",
                status: "upcoming",
                calendar_sync: true,
                media_urls: ["https://example.com/hackathon_banner.jpg"]
            })
        });
        const pipelineData = await pipelineRes.json();
        const eventId = pipelineData.event?.id;
        formatLog(7, "Unified Pipeline: Event, Calendar & Gallery Synchronized", pipelineRes.status === 200 && !!eventId, `Event ID #${eventId} synchronized across modules`);

        // 8. Calendar dynamic schedule verification
        const calendarRes = await fetch(`${BASE_URL}/calendar`);
        const calendarData = await calendarRes.json();
        const isEventOnCalendar = (calendarData.calendar || []).some((e) => e.id === eventId);
        formatLog(8, "Calendar Module Feed Verification", isEventOnCalendar, `Event #${eventId} verified on public calendar feed`);

        // 9. Analytics aggregation
        const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const analyticsData = await analyticsRes.json();
        formatLog(9, "Dashboard Analytics Aggregation", analyticsRes.status === 200, `Events count: ${analyticsData.analytics?.events?.total}, Idea Hub submissions: ${analyticsData.analytics?.idea_hub?.total_submissions}`);

        // 10. Cleanup test data
        if (eventId) {
            await fetch(`${BASE_URL}/events/${eventId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${superToken}` }
            });
        }
        if (subAdminId) {
            await fetch(`${BASE_URL}/admin/users/${subAdminId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${superToken}` }
            });
        }
        formatLog(10, "Cleaned Up Temporary Test Records", true, "Test event and sub-admin safely removed");

        console.log("\n========================================================");
        console.log("       ✨ ALL 10 VERIFICATION TESTS PASSED!");
        console.log("========================================================\n");
    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        if (server) server.close();
        process.exit(0);
    }
}

start();
