import assert from "node:assert/strict";
import { test } from "node:test";
import { ConsoleLogger, LogEvent, Logger, LogLevel } from "../../dist";

class CapturingLogger extends Logger {
    events: LogEvent[] = [];
    constructor() { super("test", "request-1", { id: "tracker-1", label: "copy", custom: { jobId: "job-1", id: "custom-id" } }); }
    protected writeLogEvent(event: LogEvent): void { this.events.push(event); }
}

test("structured logging preserves nested diagnostics, dates, URLs, and inputs", () => {
    const logger = new CapturingLogger();
    const url = "https://bucket.s3.amazonaws.com/video.mp4?X-Amz-Credential=test&X-Amz-Security-Token=test&X-Amz-Signature=test";
    const message = Object.freeze({ jobId: "job-1", requests: Object.freeze([{ status: 200 }]), date: new Date("2026-01-01T00:00:00Z"), url });
    const before = JSON.stringify(message);
    logger.debug(message);
    const output = JSON.parse(logger.events[0].toString());
    assert.deepEqual(output.message, JSON.parse(before));
    assert.equal(output.requestId, "request-1");
    assert.equal(output.trackerId, "tracker-1");
    assert.equal(output.trackerJobId, "job-1");
    assert.equal(output.trackerCustomId, "custom-id");
    assert.equal(JSON.stringify(message), before);
});

test("all public log methods retain their level and type", () => {
    const logger = new CapturingLogger();
    const cases: [keyof Logger, number, string][] = [
        ["fatal", 100, "FATAL"], ["error", 200, "ERROR"], ["warn", 300, "WARN"],
        ["info", 400, "INFO"], ["debug", 500, "DEBUG"],
        ["functionStart", 450, "FUNCTION_START"], ["functionEnd", 450, "FUNCTION_END"],
        ["jobStart", 400, "JOB_START"], ["jobUpdate", 400, "JOB_UPDATE"], ["jobEnd", 400, "JOB_END"]
    ];
    for (const [method, level, type] of cases) {
        (logger[method] as (message: string) => void)("hello");
        const event = logger.events[logger.events.length - 1];
        assert.equal(event.level, level);
        assert.equal(event.type, type);
    }
});

test("string formatting and multiple structured arguments retain existing behavior", () => {
    const logger = new CapturingLogger();
    logger.info("job %s: %j", "job-1", { status: "done" });
    assert.equal(JSON.parse(logger.events[0].toString()).message, 'job job-1: {"status":"done"}');
    logger.info({ jobId: "job-1" }, { status: "done" }, 42);
    assert.deepEqual(JSON.parse(logger.events[1].toString()).message, [{ jobId: "job-1" }, { status: "done" }, 42]);
});

test("errors preserve stack details", () => {
    const logger = new CapturingLogger();
    const error = new Error("copy failed");
    logger.error(error);
    assert.equal(JSON.parse(logger.events[0].toString()).message, error.stack);
});

test("cyclic messages use a diagnostic fallback without mutating input", () => {
    const message: { jobId: string, self?: unknown } = { jobId: "job-1" };
    message.self = message;
    const logger = new CapturingLogger();
    logger.debug(message);
    const output = JSON.parse(logger.events[0].toString());
    assert.equal(typeof output.message, "string");
    assert.match(output.message, /job-1/);
    assert.equal(message.self, message);
});

test("console logger emits valid JSON to the appropriate stream", t => {
    const stdout = t.mock.method(console, "log", (..._args: any[]) => {});
    const stderr = t.mock.method(console, "error", (..._args: any[]) => {});
    const warnings = t.mock.method(console, "warn", (..._args: any[]) => {});
    const logger = new ConsoleLogger("console-test", "request-1");
    logger.info({ jobId: "job-1" });
    logger.warn("warning");
    logger.error("failure");
    logger.log(0, "DISABLED", "hidden");
    assert.equal(stdout.mock.callCount(), 1);
    assert.equal(warnings.mock.callCount(), 1);
    assert.equal(stderr.mock.callCount(), 1);
    assert.equal(JSON.parse(stdout.mock.calls[0].arguments[0]).message.jobId, "job-1");
    assert.equal(JSON.parse(stderr.mock.calls[0].arguments[0]).level, LogLevel.Error);
});
