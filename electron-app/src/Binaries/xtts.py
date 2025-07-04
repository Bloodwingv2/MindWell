import os
from io import BytesIO
import soundfile as sf
import simpleaudio as sa
import threading
import queue
from torch.serialization import add_safe_globals
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.api import TTS


# Force load despite PyTorch restriction
os.environ['TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD'] = '1'

# Resolved full path relative to current file's folder (binaries/) by adding base directory
base_dir = os.path.dirname(os.path.abspath(__file__))
speaker_path = os.path.join(base_dir, "..", "Voice_Samples", "ISAC_Unfiltered.wav")

# Register model config
add_safe_globals([XttsConfig])

# Add queue for threading
audio_buffer = queue.Queue()
# Load model
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

if torch.cuda.is_available():
    tts.to("cuda")  # Recommended instead of gpu=True
else:
    tts.to("cpu")
    
def play_audio(): # Created a seperate function to play generated tts audio 
    while True:
        # Pop audio output from thread
        wav = audio_buffer.get()

        # XTTS default sample rate
        sample_rate = 22050

        # Write WAV to in-memory buffer
        buffer = BytesIO()
        sf.write(buffer, wav, sample_rate, format="WAV")
        buffer.seek(0)

        # Play audio
        wave_obj = sa.WaveObject.from_wave_file(buffer)
        play_obj = wave_obj.play()
        play_obj.wait_done()

        audio_buffer.task_done()

threading.Thread(target=play_audio, daemon=True).start()

def synthesis(recieved_text): # LOOP THIS
    # Synthesize speech
    wav = tts.tts(
        text = recieved_text,
        speaker_wav= speaker_path,
        language="en"
    )
    audio_buffer.put(wav) # enqueue the audio to thread
    # threading.Thread(target=play_audio, args=(wav), daemon = True).start()