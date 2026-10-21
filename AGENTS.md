# Architecture rules
- Calculate prayer times on-device using Adhan and coordinate-based timezone lookup; coordinates must not be sent to a prayer-time service.
- Keep prayer reminder settings and location on the device, separate from Adhkar reminders; refresh the rolling notification schedule when the app opens.
- Use separate immutable Android notification channels for advance reminders and optional Adhan sounds; bundle the notification excerpt as a native raw resource and serve full manual playback via the licensed asset pointer.
- Calculate Qibla locally with Adhan; use a registered Android Compass plugin with rotation-vector sensors and geomagnetic declination for true-north heading, and never substitute relative browser orientation for north.
- Keep electronic tasbih count in device-local storage, independent of Adhkar counters, so counting survives reopening without changing existing reminders.