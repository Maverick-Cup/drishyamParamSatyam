#!/usr/bin/env python3
"""
ParamSathya - Path A: Standalone Local CPU Lip-Sync Microservice
Runs on any Intel/AMD CPU without requiring an NVIDIA GPU.

Usage:
  pip install flask lipsync  # or clone facefusion
  python scripts/lipsync_server.py --port 5000

Zero Secret / Completely Offline & Free
"""

import os
import sys
import argparse
import subprocess
import tempfile
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'HEALTHY',
        'engine': 'cpu',
        'service': 'ParamSathya Path A Lip-Sync Server'
    })

@app.route('/sync', methods=['POST'])
def sync():
    """
    Accepts:
      video: Image or MP4 video file
      audio: WAV or MP3 audio file
    Returns:
      MP4 video with synchronized lips
    """
    if 'video' not in request.files or 'audio' not in request.files:
        return jsonify({'error': 'Both video and audio files are required'}), 400

    video_file = request.files['video']
    audio_file = request.files['audio']

    with tempfile.TemporaryDirectory() as tmpdir:
        input_video_path = os.path.join(tmpdir, 'input_source.mp4' if video_file.filename.endswith('.mp4') else 'input_source.png')
        input_audio_path = os.path.join(tmpdir, 'input_audio.wav')
        output_video_path = os.path.join(tmpdir, 'output_synced.mp4')

        video_file.save(input_video_path)
        audio_file.save(input_audio_path)

        # Check if facefusion CLI is installed, otherwise fallback to lipsync package or ffmpeg
        try:
            # 1. Primary: facefusion with CPU execution provider
            cmd = [
                "facefusion", "run",
                "--processors", "lip_syncer",
                "-s", input_video_path,
                "-a", input_audio_path,
                "-o", output_video_path,
                "--execution-providers", "cpu",
                "--headless"
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode == 0 and os.path.exists(output_video_path):
                return send_file(output_video_path, mimetype='video/mp4')
        except FileNotFoundError:
            pass

        try:
            # 2. Alternative: python -m lipsync
            cmd_alt = [
                sys.executable, "-m", "lipsync",
                "--video", input_video_path,
                "--audio", input_audio_path,
                "--output", output_video_path
            ]
            res = subprocess.run(cmd_alt, capture_output=True, text=True)
            if res.returncode == 0 and os.path.exists(output_video_path):
                return send_file(output_video_path, mimetype='video/mp4')
        except FileNotFoundError:
            pass

        return jsonify({
            'success': False,
            'message': 'Neither facefusion nor lipsync executable found on PATH. Run "pip install lipsync" or "python install.py default" in your environment.',
            'tip': 'You can also use Path B (Google Colab with free T4 GPU) for instant GPU acceleration without installing packages locally.'
        }), 501

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ParamSathya Local CPU Lip-Sync Server')
    parser.add_argument('--port', type=int, default=5000, help='Port to run Flask server on')
    args = parser.parse_args()

    print(f"==================================================")
    print(f"ParamSathya Path A (Local CPU Lip-Sync) starting on port {args.port}")
    print(f"Endpoint: http://localhost:{args.port}/sync")
    print(f"Execution Provider: CPU (Zero GPU required)")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=args.port, debug=False)
