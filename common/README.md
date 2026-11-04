# 공통 운영 파일

빅데이터와 MySQL이 함께 사용하는 배포·개발 도구를 모은 폴더입니다. 과목별 문제와 코드는 [빅데이터](../bigdata/)와 [MySQL](../mysql/)에서 수정하세요.

| 폴더·파일 | 용도 |
| --- | --- |
| [public/](public/) | 실제 웹사이트에 업로드할 완성 파일 |
| [scripts/](scripts/) | 빌드·검사·로컬 미리보기 도구 |
| [tests/](tests/) | 두 공부방의 공통 경로·링크 검사 |
| [docs/](docs/) | 개발·배포 방법과 검증 범위 |
| [licenses/](licenses/) | 사용한 외부 라이브러리의 라이선스 |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | 외부 소프트웨어 사용 안내 |

명령어는 저장소 루트에서 `npm ci`, `npm run build`, `npm test`, `npm run serve`로 실행합니다. 배포 폴더는 **`common/public`**입니다. 자세한 내용은 [개발·배포 안내](docs/DEVELOPMENT.md)를 참고하세요.
