"use client";

import PianoKeyboard from "@/components/piano";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { use, useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export type Instrument = {
    name: string;
    transposition: number;
};

export const instruments: Instrument[] = [
    { name: "Piccolo", transposition: 0 }, // Sounds octave(s) higher, 0 semitone difference within octave
    { name: "Flute", transposition: 0 }, // Non-transposing
    { name: "Alto Flute in G", transposition: -4 }, // Sounds P4 lower (-4 semitones)
    { name: "Oboe", transposition: 0 }, // Non-transposing
    { name: "English Horn in F", transposition: 5 }, // Sounds P5 lower (-7), simplest equivalent is P4 higher (+5)
    { name: "Clarinet in E♭", transposition: 3 }, // Sounds m3 higher (+3 semitones)
    { name: "Clarinet in B♭", transposition: -2 }, // Sounds M2 lower (-2 semitones)
    { name: "Clarinet in A", transposition: -3 }, // Sounds m3 lower (-3 semitones)
    { name: "Bass Clarinet in B♭", transposition: -2 }, // Sounds M9 lower (-14), M2 lower within octave (-2)
    { name: "Bassoon", transposition: 0 }, // Non-transposing
    { name: "Contrabassoon", transposition: 0 }, // Sounds octave lower, 0 semitone difference within octave
    { name: "Soprano Saxophone in B♭", transposition: -2 }, // Sounds M2 lower (-2 semitones)
    { name: "Alto Saxophone in E♭", transposition: 3 }, // Sounds M6 lower (-9), simplest equivalent is m3 higher (+3)
    { name: "Tenor Saxophone in B♭", transposition: -2 }, // Sounds M9 lower (-14), M2 lower within octave (-2)
    { name: "Baritone Saxophone in E♭", transposition: 3 }, // Sounds M13 lower (-21), simplest equivalent is m3 higher (+3)
    { name: "French Horn in F", transposition: 5 }, // Sounds P5 lower (-7), simplest equivalent is P4 higher (+5)
    { name: "Trumpet in B♭", transposition: -2 }, // Sounds M2 lower (-2 semitones)
    { name: "Cornet in B♭", transposition: -2 }, // Sounds M2 lower (-2 semitones)
    { name: "Flugelhorn in B♭", transposition: -2 }, // Sounds M2 lower (-2 semitones)
    { name: "Trombone", transposition: 0 }, // Non-transposing
    { name: "Bass Trombone", transposition: 0 }, // Non-transposing
    { name: "Euphonium", transposition: 0 }, // Usually non-transposing (Concert pitch bass clef)
    { name: "Tuba", transposition: 0 }, // Non-transposing
    { name: "Timpani", transposition: 0 }, // Non-transposing
    { name: "Glockenspiel", transposition: 0 }, // Sounds octave(s) higher, 0 semitone difference within octave
    { name: "Xylophone", transposition: 0 }, // Sounds octave higher, 0 semitone difference within octave
    { name: "Celesta", transposition: 0 }, // Sounds octave higher, 0 semitone difference within octave
    { name: "Harp", transposition: 0 }, // Non-transposing
    { name: "Piano", transposition: 0 }, // Non-transposing
    { name: "Violin", transposition: 0 }, // Non-transposing
    { name: "Viola", transposition: 0 }, // Non-transposing
    { name: "Cello", transposition: 0 }, // Non-transposing
    { name: "Double Bass", transposition: 0 }, // Sounds octave lower, 0 semitone difference within octave
    { name: "Guitar", transposition: 0 }, // Sounds octave lower, 0 semitone difference within octave
];

const NOTES_CYCLE: string[] = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];

const ENHARMONIC_EQUIVALENTS: { [key: string]: string } = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    // Less common but good to handle
    Cb: "B",
    Fb: "E",
    Esharp: "F", // Using 'sharp' instead of '#' to avoid regex issues if used
    Bsharp: "C", // Using 'sharp' instead of '#'
    "E#": "F", // Handling direct input
    "B#": "C", // Handling direct input
};

function transposeNoteName(noteName: string, semitones: number): string {
    // 1. Normalize the input note name
    let normalizedNote = noteName.trim();
    if (normalizedNote.length > 1 && normalizedNote.charAt(1) === "b") {
        // Handle flats: Check if it's in the map
        normalizedNote =
            ENHARMONIC_EQUIVALENTS[normalizedNote] || normalizedNote;
    } else if (normalizedNote.length > 1 && normalizedNote.charAt(1) === "#") {
        // Handle specific sharp enharmonics (E#, B#)
        normalizedNote =
            ENHARMONIC_EQUIVALENTS[normalizedNote] || normalizedNote;
    } else if (normalizedNote.length === 1) {
        // Basic note A-G, no normalization needed initially
    } else if (normalizedNote.length > 2) {
        // Could be C##, Fbb etc. - this simple function doesn't handle double accidentals
        // Or invalid input like 'Csharp' - let the indexOf check handle it
    }

    // Handle potential Cb/Fb normalization if not already done
    if (normalizedNote === "Cb") normalizedNote = "B";
    if (normalizedNote === "Fb") normalizedNote = "E";

    // 2. Find the index of the normalized note
    let noteIndex = NOTES_CYCLE.indexOf(normalizedNote);

    if (noteIndex === -1) {
        // Check again for B# and E# which map to notes without accidentals
        if (noteName === "B#") {
            noteIndex = NOTES_CYCLE.indexOf("C");
        } else if (noteName === "E#") {
            noteIndex = NOTES_CYCLE.indexOf("F");
        } else {
            throw new Error(
                `Invalid or unsupported note name: "${noteName}". Could not normalize to one of ${NOTES_CYCLE.join(", ")}.`,
            );
        }
    }

    // 3. Calculate the transposed index
    // Add the number of notes in the cycle (12) before taking the modulo
    // to correctly handle negative results from transposition downwards.
    const transposedIndex = (noteIndex + (semitones % 12) + 12) % 12;

    // 4. Return the note name from the NOTES_CYCLE array
    return NOTES_CYCLE[transposedIndex];
}

// flats to sharps

function flatsToSharps(noteName: string): string {
    const noteMap: { [key: string]: string } = {
        Db: "C#",
        Eb: "D#",
        Gb: "F#",
        Ab: "G#",
        Bb: "A#",
    };
    return noteMap[noteName as keyof typeof noteMap] || noteName;
}

export default function Home() {
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [useFlats, setUseFlats] = useState(false);
    const [transpose, setTranspose] = useState(0);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [toTranspose, setToTranspose] = useState(0);

    useEffect(() => {
        if (selectedKey) {
            const transposedKey = transposeNoteName(selectedKey, transpose);
            const targetKey = transposeNoteName(transposedKey, toTranspose);
            setActiveKey(useFlats ? flatsToSharps(targetKey) : targetKey);
        } else {
            setActiveKey(null);
        }
    }, [selectedKey, transpose, toTranspose, useFlats]);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen gap-16">
            <h1 className="hidden lg:block text-6xl font-bold">Auto Transpose</h1>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <Card className="p-8">
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                        <Select
                            onValueChange={(value) => {
                                const instrument = instruments.find(
                                    (instrument) => instrument.name === value,
                                );
                                if (instrument) {
                                    setTranspose(instrument.transposition);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select and Instrument" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Instruments</SelectLabel>
                                    {instruments.map((instrument) => (
                                        <SelectItem
                                            key={instrument.name}
                                            value={instrument.name}
                                        >
                                            {instrument.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {"Or"}
                        <Input
                            placeholder="Enter number of semitones eg. 3 or -2"
                            type="number"
                            max={12}
                            min={-12}
                            value={transpose}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                    setTranspose(value);
                                }
                            }}
                        />
                    </div>
                    <PianoKeyboard
                        onKeySelect={setSelectedKey}
                        useFlats={useFlats}
                    />
                </Card>

                <Toggle
                    variant={"outline"}
                    onClick={() => {
                        setUseFlats(!useFlats);
                    }}
                    pressed={useFlats}
                >
                    Use Flats
                </Toggle>

                <Card className="p-8">
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                        <Select
                            onValueChange={(value) => {
                                const instrument = instruments.find(
                                    (instrument) => instrument.name === value,
                                );
                                if (instrument) {
                                    setToTranspose(instrument.transposition);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select and Instrument" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Instruments</SelectLabel>
                                    {instruments.map((instrument) => (
                                        <SelectItem
                                            key={instrument.name}
                                            value={instrument.name}
                                        >
                                            {instrument.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {"Or"}
                        <Input
                            placeholder="Enter number of semitones eg. 3 or -2"
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                    setToTranspose(value);
                                }
                            }}
                            type="number"
                            max={12}
                            min={-12}
                            value={toTranspose}
                        />
                    </div>
                    <PianoKeyboard
                        disabled
                        onKeySelect={setSelectedKey}
                        useFlats={useFlats}
                        activeKey={activeKey}
                    />
                </Card>
            </div>
        </div>
    );
}
