import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    CSSProperties,
    FC,
  } from 'react';
  import {
    Renderer,
    Stave,
    StaveNote,
    Voice,
    Formatter,
    Accidental, // Keep Accidental import if you might add cautionary ones later
    // Beam,
  } from 'vexflow';
  
  // --- Type Definitions ---
  type SimpleClefType = 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  
  interface VexFlowScoreProps {
    notesString?: string;
    clef?: SimpleClefType;
    style?: CSSProperties;
    className?: string;
  }
  
  interface Dimensions {
    width: number;
    height: number;
  }
  
  // --- Helper Function (Corrected) ---
  const parseNotes = (
    notesString: string | undefined,
    clef: SimpleClefType = 'treble'
  ): StaveNote[] => {
    if (!notesString || typeof notesString !== 'string') {
      return [];
    }
  
    // Regex now captures: 1=Note(A-G), 2=Accidental(#|b), 3=Octave
    const noteRegex = /([A-Ga-g])([#b]?)(\d)/;
    const noteTokens = notesString.trim().split(/\s+/);
  
    const parsedNotes: StaveNote[] = [];
  
    noteTokens.forEach((token) => {
      const match = token.match(noteRegex);
      if (!match) {
        console.warn(`Invalid note format: "${token}". Skipping.`);
        return;
      }
  
      // Destructure captures
      const [, noteLetter, accidentalSymbol, octave] = match;
  
      // *** CORRECTED KEY CONSTRUCTION ***
      // Combine note, accidental (if present), and octave directly
      // VexFlow expects keys like "c#/4", "eb/5", "a/4"
      const vexKey = `${noteLetter.toLowerCase()}${
        accidentalSymbol || '' // Append # or b if it exists, otherwise empty string
      }/${octave}`;
  
      try {
        // Create the StaveNote with the correctly formatted key
        const staveNote = new StaveNote({
          keys: [vexKey], // Pass the key with the accidental included
          duration: 'q', // Default to quarter note
          clef: clef,
          // auto_stem: true, // Optional: let VexFlow decide stem direction
        });
  
        // *** REMOVED addAccidental CALL ***
        // No need to call addAccidental here, it's handled by the key string.
        // If you needed *explicit* accidentals (e.g., cautionary), you'd use
        // Accidental.applyAccidentals([voice], 'C'); after formatting.
  
        parsedNotes.push(staveNote);
      } catch (error) {
        console.warn(`Error creating StaveNote for key "${vexKey}":`, error);
      }
    });
  
    return parsedNotes;
  };
  
  // --- Component Definition (No changes needed here) ---
  const VexFlowScore: FC<VexFlowScoreProps> = ({
    notesString = '',
    clef = 'treble',
    style = {},
    className = '',
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const [dimensions, setDimensions] = useState<Dimensions>({
      width: 0,
      height: 0,
    });
  
    // --- Dimension Tracking (No changes needed) ---
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const updateDims = () => {
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: container.clientHeight,
          });
        }
      };
      updateDims();
      const resizeObserver = new ResizeObserver(updateDims);
      resizeObserver.observe(container);
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
  
    // --- VexFlow Rendering (No changes needed) ---
    const drawMusic = useCallback(() => {
      const { width, height } = dimensions;
      const container = containerRef.current;
      if (!container || width <= 0 || height <= 0) return;
      container.innerHTML = '';
  
      try {
        const renderer = new Renderer(container, Renderer.Backends.SVG);
        rendererRef.current = renderer;
        renderer.resize(width, height);
        const context = renderer.getContext();
  
        const stavePadding = 20;
        const staveWidth = width - stavePadding * 2;
        if (staveWidth <= 0) return;
  
        const staveY = clef === 'bass' ? 10 : 0;
        const stave = new Stave(stavePadding / 2, staveY, staveWidth);
        stave.addClef(clef);
        stave.setContext(context).draw();
  
        const notes = parseNotes(notesString, clef);
  
        if (notes.length > 0) {
          const voice = new Voice({ num_beats: 4, beat_value: 4 });
          voice.setStrict(false);
          voice.addTickables(notes);
  
          const formatterWidth = staveWidth * 0.9;
          new Formatter().joinVoices([voice]).format([voice], formatterWidth);
  
          voice.draw(context, stave);
  
          // If you wanted automatic accidentals based on key signature (not implemented here)
          // or cautionary accidentals, you might call something like this *after* format:
          // Accidental.applyAccidentals([voice], keySignatureString);
        } else {
          context.fillText('No valid notes', width / 2 - 30, height / 2);
        }
      } catch (error) {
        console.error('VexFlow rendering error:', error);
        container.innerHTML =
          '<p style="color: red; text-align: center;">Error rendering score</p>';
      }
    }, [dimensions, notesString, clef]);
  
    // Effect to trigger drawing (No changes needed)
    useEffect(() => {
      drawMusic();
    }, [drawMusic]);
  
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '150px',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* VexFlow SVG rendered here */}
      </div>
    );
  };
  
  export default VexFlowScore;
  