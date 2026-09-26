# Performance Verification — Private Photo Fantasy Board

**Date:** September 23, 2026  
**Method:** Existing synthetic Vitest benchmarks; no real-device profiling.

The benchmark suite passed in the latest run. It creates synthetic photo IDs at 1,000, 5,000, 10,000, and 20,000 items and asserts engine timings against limits. It also bulk-inserts 5,000 synthetic metadata records, checks a filtered result count, and checks serialized sample-record size.

| Measured code path | Synthetic size | Test assertion | Latest result |
| --- | ---: | --- | --- |
| Shuffle initialization | 1k–20k | Under 100 ms | Pass |
| 100 four-photo advances | 1k–20k | Average under 5 ms per advance | Pass |
| One replacement | 1k–20k | Under 10 ms | Pass |
| Player 50-step advance history | 20k IDs | Under 100 ms | Pass |
| Player 50-step rewind | 20k IDs | Under 20 ms | Pass |
| Dexie bulk insert | 5k metadata rows | Count equals 5,000 | Pass |
| Filtered metadata scan | 5k metadata rows | 450 expected matches and under 200 ms | Pass |
| Serialized sample metadata | One row | Under 500 bytes | Pass |

The test runner reported the benchmark test file completing in about 1.1 seconds on this host. That is not a per-operation timing report. Earlier documents gave precise per-operation milliseconds and claimed indexed-query, heap, and device-memory results without reproducible measurement; those figures are withdrawn. This suite does not measure image decoding, file import, IndexedDB Blob storage, browser quota, UI frame rate, or mobile hardware. Profile those with the owner's actual files and devices before release.
