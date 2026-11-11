# 외부 구성 요소와 자료 출처

이 폴더는 교육용 Workbench 연동 코드와 예제 자료를 제공합니다. 모델 가중치나 Ollama 실행 파일은 Git에 포함하지 않습니다.

| 구성 요소 | 출처 | 안내 |
| --- | --- | --- |
| Ollama | [공식 저장소](https://github.com/ollama/ollama) · [Windows 설치](https://docs.ollama.com/windows) | 별도 설치. 원래 휴대용 배포본에 포함됐던 MIT 라이선스 사본은 [licenses/OLLAMA_LICENSE.txt](licenses/OLLAMA_LICENSE.txt)에 보존 |
| Qwen2.5-Coder 3B | [Ollama 모델 페이지](https://ollama.com/library/qwen2.5-coder:3b) · [Qwen 공식 저장소](https://github.com/QwenLM/Qwen2.5-Coder) | `qwen2.5-coder:3b` 태그로 별도 다운로드. 원래 모델에 동봉된 Qwen Research License 사본은 [licenses/QWEN_MODEL_LICENSE.txt](licenses/QWEN_MODEL_LICENSE.txt)에 보존 |
| MySQL Workbench | [공식 플러그인 문서](https://dev.mysql.com/doc/workbench/en/wb-plugins.html) · [공식 소스](https://github.com/mysql/mysql-workbench) | 사용자 환경에서 별도 설치. Workbench 실행기·내장 라이브러리를 재배포하지 않음 |
| SQL 연습 자료 | [이 저장소의 SQL 작업실](../src/content.js) · [원본 HTML](../standalone/) | 연습 테이블과 52개 문제·답안을 `course.json`에 스냅샷으로 보관 |

각 외부 구성 요소의 사용·배포 조건은 해당 버전의 원문 라이선스를 확인하세요. 모델의 라이선스와 프로젝트 코드의 라이선스는 구분됩니다. 저장소 공개가 모든 구성 요소에 대한 동일한 사용 허가를 뜻하지 않습니다.

모델 고지 원문:

> Qwen is licensed under the Qwen RESEARCH LICENSE AGREEMENT, Copyright (c) Alibaba Cloud. All Rights Reserved.

이 코드는 기존 모델의 로컬 추론과 참고 예제를 이용합니다. 자체 모델 학습 또는 미세 조정을 수행하지 않았습니다. 프로젝트 자체에는 저장소 기존 방침과 같이 별도의 오픈소스 라이선스를 추가하지 않았습니다.
