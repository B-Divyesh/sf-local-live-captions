# Linux-audio acceptance fixture

`jfk.wav` is the JFK speech sample distributed by `ggerganov/whisper.cpp`.
It contains a public-domain excerpt of the 20 January 1961 United States
inaugural address. The acceptance script plays it only into an isolated local
PulseAudio null sink; it is never uploaded.

Source: <https://github.com/ggerganov/whisper.cpp/blob/master/samples/jfk.wav>

SHA-256: `59dfb9a4acb36fe2a2affc14bacbee2920ff435cb13cc314a08c13f66ba7860e`

`german.wav` is an original synthetic reading created for this repository on
29 August 2026 with eSpeak NG's German voice. Its spoken text is: “Guten
Morgen. Heute sprechen wir über Sterne und Planeten. Bitte lesen Sie die nächste
Folie.” It contains no personal data or third-party recording and is used only
for the German monitor-to-caption acceptance run.

The acceptance harness opens the monitor stream before starting playback, then
runs this real capture four times in succession. It requires a multiword,
recognizable German result from the local multilingual model. This prevents a
PulseAudio startup race from dropping the opening words and makes the caption
regression repeatable without claiming verbatim accuracy.

SHA-256: `a6b95e58402031ebc4d367a7e6f50a28933135424858f96ed2a45f42d77251d`
