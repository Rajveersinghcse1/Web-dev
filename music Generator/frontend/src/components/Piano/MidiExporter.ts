// MIDI export utility for piano recordings
export interface MidiNote {
  note: number;
  velocity: number;
  time: number;
  duration: number;
}

export class MidiExporter {
  private static noteNameToMidi(noteName: string, octave: number): number {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    return (octave + 1) * 12 + noteMap[noteName];
  }

  static convertNotesToMidi(notes: any[], octave: number = 4): MidiNote[] {
    return notes.map(note => ({
      note: this.noteNameToMidi(note.key, octave),
      velocity: Math.round(note.velocity * 127),
      time: note.timestamp / 1000, // Convert to seconds
      duration: note.duration || 0.5 // Default duration
    }));
  }

  static exportMidi(notes: MidiNote[], tempo: number = 120): Uint8Array {
    // Simple MIDI file creation
    const ticksPerQuarter = 480;
    const microsecondsPerQuarter = Math.round(60000000 / tempo);
    
    // MIDI header
    const header = new Uint8Array([
      // MThd chunk
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length
      0x00, 0x00, // Format 0
      0x00, 0x01, // 1 track
      0x01, 0xE0  // Ticks per quarter note (480)
    ]);

    // Track header
    const trackHeader = new Uint8Array([
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      0x00, 0x00, 0x00, 0x00  // Length placeholder
    ]);

    // Track events
    const events: number[] = [];
    
    // Tempo event
    events.push(0x00, 0xFF, 0x51, 0x03); // Delta time, Meta event, Set tempo, length
    events.push((microsecondsPerQuarter >> 16) & 0xFF);
    events.push((microsecondsPerQuarter >> 8) & 0xFF);
    events.push(microsecondsPerQuarter & 0xFF);

    // Convert notes to MIDI events
    const sortedNotes = notes.sort((a, b) => a.time - b.time);
    let lastTime = 0;

    sortedNotes.forEach(note => {
      const deltaTime = Math.round((note.time - lastTime) * ticksPerQuarter);
      
      // Note on
      this.writeVariableLength(events, deltaTime);
      events.push(0x90, note.note, note.velocity); // Note on, channel 0
      
      // Note off (after duration)
      const noteDuration = Math.round(note.duration * ticksPerQuarter);
      this.writeVariableLength(events, noteDuration);
      events.push(0x80, note.note, 0x40); // Note off
      
      lastTime = note.time + note.duration;
    });

    // End of track
    events.push(0x00, 0xFF, 0x2F, 0x00);

    // Update track length
    const trackLength = events.length;
    trackHeader[7] = trackLength & 0xFF;
    trackHeader[6] = (trackLength >> 8) & 0xFF;
    trackHeader[5] = (trackLength >> 16) & 0xFF;
    trackHeader[4] = (trackLength >> 24) & 0xFF;

    // Combine all parts
    const result = new Uint8Array(header.length + trackHeader.length + events.length);
    result.set(header, 0);
    result.set(trackHeader, header.length);
    result.set(events, header.length + trackHeader.length);

    return result;
  }

  private static writeVariableLength(buffer: number[], value: number): void {
    if (value >= 0x80) {
      this.writeVariableLength(buffer, value >> 7);
      buffer.push((value & 0x7F) | 0x80);
    } else {
      buffer.push(value & 0x7F);
    }
  }

  static downloadMidi(midiData: Uint8Array, filename: string = 'piano-recording.mid'): void {
    const blob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}