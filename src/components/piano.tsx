"use client";

import React from "react";
import { Button } from "./ui/button";
import { useState } from "react";

interface PianoKeyboardLightProps {
    onKeySelect?: (key: string) => void;
    disabled?: boolean;
    useFlats?: boolean;
    activeKey?: string | null;
}

function PianoKeyboardLight({
    onKeySelect,
    disabled = false,
    useFlats = true,
    activeKey,
}: PianoKeyboardLightProps) {
    const classes = "w-8 h-8";
    const selectedClasses =
        "w-8 h-8 bg-blue-500 text-white hover:bg-blue-600 hover:text-white";

    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const sharpToFlat = {
        "C#": "Db",
        "D#": "Eb",
        "F#": "Gb",
        "G#": "Ab",
        "A#": "Bb",
    };

    const convertToFlat = (key: string | null) => {
        if (!key) return null;
        return sharpToFlat[key as keyof typeof sharpToFlat] || key;
    };

    const currentKey =
        activeKey !== undefined ? convertToFlat(activeKey) : selectedKey;

    const noteMap = {
        Db: "C#",
        Eb: "D#",
        Gb: "F#",
        Ab: "G#",
        Bb: "A#",
    };

    const getNoteName = (flatName: string) => {
        if (!useFlats && noteMap[flatName as keyof typeof noteMap]) {
            return noteMap[flatName as keyof typeof noteMap];
        }
        return flatName;
    };

    const handleKeySelect = (key: string) => {
        if (disabled) return;
        if (activeKey === undefined) {
            setSelectedKey(key);
        }
        onKeySelect?.(key);
    };

    return (
        // Container with light background and padding
        <div className="inline-block">
            {/* Relative container to help position black keys */}
            <div className="relative">
                {/* Black Keys Row - Positioned slightly offset and above */}
                {/* Using absolute positioning might be more precise, but flex with margins is simpler here */}
                <div className="relative flex space-x-2 mb-1 ml-5.5">
                    {" "}
                    {/* ml-6 shifts the start */}
                    <Button
                        className={
                            currentKey === "Db" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("Db")}
                    >
                        {getNoteName("Db")}
                    </Button>
                    <Button
                        className={
                            currentKey === "Eb" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("Eb")}
                    >
                        {getNoteName("Eb")}
                    </Button>
                    {/* Add extra margin for the gap over E/F */}
                    <Button
                        className={`${currentKey === "Gb" ? selectedClasses : classes} ml-10`}
                        variant={"outline"}
                        onClick={() => handleKeySelect("Gb")}
                    >
                        {getNoteName("Gb")}
                    </Button>{" "}
                    {/* ml-4 creates the larger gap */}
                    <Button
                        className={
                            currentKey === "Ab" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("Ab")}
                    >
                        {getNoteName("Ab")}
                    </Button>
                    <Button
                        className={
                            currentKey === "Bb" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("Bb")}
                    >
                        {getNoteName("Bb")}
                    </Button>
                </div>

                {/* White Keys Row */}
                <div className="relative flex space-x-2">
                    <Button
                        className={
                            currentKey === "C" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("C")}
                    >
                        C
                    </Button>
                    <Button
                        className={
                            currentKey === "D" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("D")}
                    >
                        D
                    </Button>
                    <Button
                        className={
                            currentKey === "E" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("E")}
                    >
                        E
                    </Button>
                    <Button
                        className={
                            currentKey === "F" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("F")}
                    >
                        F
                    </Button>
                    <Button
                        className={
                            currentKey === "G" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("G")}
                    >
                        G
                    </Button>
                    <Button
                        className={
                            currentKey === "A" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("A")}
                    >
                        A
                    </Button>
                    <Button
                        className={
                            currentKey === "B" ? selectedClasses : classes
                        }
                        variant={"outline"}
                        onClick={() => handleKeySelect("B")}
                    >
                        B
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PianoKeyboardLight;
