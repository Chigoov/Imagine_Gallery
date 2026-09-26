# V1 Automated Test Matrix

**Target:** `10_TESTING_CHECKLIST.md`  
**Test runner:** Vitest 3.2.7  
**Last run:** September 23, 2026  
**Result:** 74 passed, 0 failed, across 6 test files.

| Test file | Scope | Tests |
| --- | --- | ---: |
| `src/domain/__tests__/coreEngines.test.ts` | Shuffle, queue snapshot recovery, Pin, player state, session timer, calendar aggregation | 16 |
| `src/domain/__tests__/v1QualityGate.test.ts` | Domain quality-gate scenarios | 11 |
| `src/domain/__tests__/auditRegressions.test.ts` | Regression cases, public Drive link validation | 16 |
| `src/domain/__tests__/p0ChecklistValidation.test.ts` | P0 edge cases and checklist validations | 6 |
| `src/repositories/__tests__/repositories.test.ts` | IndexedDB repositories, relationships, active snapshot, Drive-link persistence/removal, source safety | 19 |
| `src/domain/__tests__/performanceBenchmark.test.ts` | Domain and metadata workload checks | 6 |
| **Total** |  | **74** |

These tests verify automated code paths only. They do not constitute browser end-to-end coverage, real-photo import testing, physical-device responsive testing, or user acceptance testing. See `V1_IMPLEMENTATION_AUDIT.md` and `V1_RELEASE_READINESS.md` for remaining verification.
