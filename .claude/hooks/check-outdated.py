#!/usr/bin/env python3
"""
PostToolUse hook: package.json 수정 시 메이저 버전 업데이트 감지
major 버전 변화(breaking changes 가능)만 경고, 마이너/패치는 무시
"""
import sys
import json
import subprocess
import re

PROJECT = '/Users/taeseongyi/Desktop/GitHub/MotivationforADHD-Nextjs-Stable'

CODEMOD_MAP = {
    'next': 'bunx @next/codemod@latest',
    '@next/third-parties': 'bunx @next/codemod@latest',
    'tailwindcss': 'bunx @tailwindcss/upgrade',
    'react': None,
    '@tanstack/react-query': None,
    'dexie': None,
}

def strip_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*[mK]', '', text)

def parse_version(v):
    try:
        return [int(x) for x in re.sub(r'[^\d.]', '', v).split('.')]
    except (ValueError, AttributeError):
        return [0]

d = json.load(sys.stdin)
fp = d.get('tool_input', {}).get('file_path', '')

# package.json 수정일 때만 실행 (node_modules 제외)
if 'package.json' not in fp or 'node_modules' in fp:
    sys.exit(0)

r = subprocess.run(
    ['bun', 'outdated'],
    capture_output=True, text=True,
    cwd=PROJECT, timeout=30
)
output = strip_ansi(r.stdout + r.stderr)

major_updates = []
for line in output.split('\n'):
    parts = [p.strip() for p in line.split('│') if p.strip()]
    if len(parts) < 4 or '.' not in parts[1]:
        continue
    pkg, cur, lat = parts[0], parts[1], parts[-1]
    cur_parts = parse_version(cur)
    lat_parts = parse_version(lat)
    if lat_parts[0] > cur_parts[0]:
        codemod = CODEMOD_MAP.get(pkg)
        major_updates.append((pkg, cur, lat, codemod))

if major_updates:
    print('⚠️  메이저 버전 업데이트 감지 — Breaking Changes 가능:')
    print()
    for pkg, cur, lat, codemod in major_updates:
        print(f'  {pkg}')
        print(f'    현재: {cur}  →  최신: {lat}')
        if codemod:
            print(f'    코드모드: {codemod}')
        else:
            print(f'    코드모드: 없음 (migration-assistant 에이전트 사용)')
        print()
    print('→ /upgrade [패키지명] 으로 마이그레이션 가이드를 확인하세요')

sys.exit(0)
