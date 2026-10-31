# 므네모시네 음성 안내

음성 파일은 므네모시네가 송출하는 관내 방송 19개에만 사용합니다. 일반 안내·접속·규정 문형은 화면에 문자로만 표시합니다. MP3 파일명은 방송 문형 ID와 같고, `manifest.json`에는 화면 문구와 낭독 문구, 파일 경로가 기록되어 있습니다.

## 제작 정보

- 음성 합성: Qwen3-TTS 0.6B Base, 로컬 실행
- 화자 기준: 사용자가 선택한 Qwen3-TTS VoiceDesign 샘플
- 음향 처리: 큰 실내의 확성기 대역, 압축과 다중 반사음
- 파일: 모노 MP3, 24 kHz
- 문형과 낭독 문구 목록: `manifest.json`

## 출처와 이용

Qwen3-TTS 코드와 모델은 Apache License 2.0으로 공개되어 있습니다. 모델은 [Qwen3-TTS 공식 저장소](https://github.com/QwenLM/Qwen3-TTS), 음성 모델과 공식 모델 정보는 [Qwen Hugging Face 페이지](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base)를 참고하십시오. 이 폴더에는 모델 가중치가 포함되어 있지 않고, 해당 모델로 생성한 음성 파일만 포함합니다.

음성은 특정 실존 인물을 모사하지 않는 합성 음성입니다. 사이트 사용자는 설정의 「관내 방송 음성」 항목에서 재생을 끌 수 있습니다.
