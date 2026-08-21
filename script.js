/* =========================================================
   BIOCHECK
   COMPLETE CLEAN SCRIPT
   PDF + IMAGE OCR + ANALYSIS + BIO LEARN + REPORT
   ========================================================= */

/* =========================================================
   BIOQUEST BACKEND — SAVE HEALTH PROFILE
========================================================= */

const BIOQUEST_API = "https://bioquest-5.onrender.com/api";

async function saveHealthProfileToDatabase(profile) {

    try {

        const response = await fetch(
            `${BIOQUEST_API}/users`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: profile.name,

                    // Temporary local email because the
                    // current Health Profile doesn't ask for email.
                    email:
                        `${profile.name
                            .trim()
                            .replace(/\s+/g, "")
                            .toLowerCase()}@bioquest.local`,

                    age: Number(profile.age),

                    gender: profile.sex,

                    height: Number(profile.height),

                    weight: Number(profile.weight)
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Could not save health profile"
            );
        }

        // Store MongoDB user ID for later report saving
        localStorage.setItem(
            "bioQuestUserId",
            data.user._id
        );

        console.log(
            "✅ Health Profile saved to MongoDB:",
            data.user
        );

        return data.user;

    } catch (error) {

        console.error(
            "❌ Health Profile database error:",
            error
        );

        return null;
    }
}
/* =========================================================
   1. ELEMENTS
========================================================= */

const startBtn =
    document.getElementById("startBtn");

const heroStartBtn =
    document.getElementById("heroStartBtn");

const analyzeSection =
    document.getElementById("analyzeSection");

const reportBtn =
    document.getElementById("reportBtn");

const dataSection =
    document.getElementById("dataSection");

const uploadReportBtn =
    document.getElementById("uploadReportBtn");

const reportUpload =
    document.getElementById("reportUpload");

const uploadStatus =
    document.getElementById("uploadStatus");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const dashboardSection =
    document.getElementById("dashboardSection");

const parameterResults =
    document.getElementById("parameterResults");

const downloadReportBtn =
    document.getElementById("downloadReportBtn");
    const healthPassportBtn =
    document.getElementById(
        "healthPassportBtn"
    );

const healthPassportSection =
    document.getElementById(
        "healthPassportSection"
    );

const saveHealthPassportBtn =
    document.getElementById(
        "saveHealthPassportBtn"
    );

const generateEmergencyQRBtn =
    document.getElementById(
        "generateEmergencyQRBtn"
    );

    const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );


/* =========================================================
   BIO LEARN / NO REPORT ELEMENTS
========================================================= */

const noReportBtn =
    document.getElementById("noReportBtn");

const haveReportBtn =
    document.getElementById("haveReportBtn");

const bioLearnSection =
    document.getElementById("bioLearnSection");

const bioLearnContent =
    document.getElementById("bioLearnContent");

const bioParameterGrid =
    document.getElementById("bioParameterGrid");

const bioParameterDetail =
    document.getElementById("bioParameterDetail");

const closeBioDetail =
    document.getElementById("closeBioDetail");

const buildProfileBtn =
    document.getElementById("buildProfileBtn");

const bioProfileResult =
    document.getElementById("bioProfileResult");


/* =========================================================
   2. PARAMETER DEFINITIONS
========================================================= */

const PARAMETER_DEFINITIONS = {

    hemoglobin: {

        name: "Hemoglobin",

        aliases: [
            "hemoglobin",
            "haemoglobin",
            "hgb"
        ],

        unit: "g/dL",

        male: {
            min: 13.5,
            max: 17.5
        },

        female: {
            min: 12,
            max: 15.5
        },

        description:
            "Hemoglobin is the oxygen-carrying protein found in red blood cells."

    },


    glucose: {

        name: "Glucose",

        aliases: [
            "fasting blood glucose",
            "fasting glucose",
            "blood glucose",
            "blood sugar",
            "glucose",
            "fbs"
        ],

        unit: "mg/dL",

        male: {
            min: 70,
            max: 99
        },

        female: {
            min: 70,
            max: 99
        },

        description:
            "Glucose is the primary circulating sugar used by cells as an energy source."

    },


    wbc: {

        name: "WBC",

        aliases: [
            "total white blood cell count",
            "total leukocyte count",
            "total leucocyte count",
            "white blood cell count",
            "white blood cells",
            "wbc count",
            "wbc",
            "tlc"
        ],

        unit: "/µL",

        male: {
            min: 4000,
            max: 11000
        },

        female: {
            min: 4000,
            max: 11000
        },

        description:
            "White blood cells are immune-system cells involved in protecting the body from infection and other threats."

    },


    platelets: {

        name: "Platelets",

        aliases: [
            "platelet count",
            "platelets",
            "plt"
        ],

        unit: "/µL",

        male: {
            min: 150000,
            max: 450000
        },

        female: {
            min: 150000,
            max: 450000
        },

        description:
            "Platelets are blood components that play an important role in normal blood clotting."

    },


    mcv: {

        name: "MCV",

        aliases: [
            "mean corpuscular volume",
            "mcv"
        ],

        unit: "fL",

        male: {
            min: 80,
            max: 100
        },

        female: {
            min: 80,
            max: 100
        },

        description:
            "MCV represents the average size of red blood cells."

    },


    ldl: {

        name: "LDL",

        aliases: [
            "low-density lipoprotein",
            "low density lipoprotein",
            "ldl cholesterol",
            "ldl"
        ],

        unit: "mg/dL",

        male: {
            min: 0,
            max: 99
        },

        female: {
            min: 0,
            max: 99
        },

        description:
            "LDL cholesterol is associated with cardiovascular risk when levels are elevated."

    }

};


/* =========================================================
   3. CURRENT DATA
========================================================= */

let currentReportData = {};

let currentAnalysis = {

    parameters: [],

    normalCount: 0,

    monitorCount: 0,

    attentionCount: 0,

    awarenessScore: 0,

    sex: "both",

    overallResult: "",

    overallMessage: "",

    profile: null

};


/* =========================================================
   4. BIO LEARN DATA
========================================================= */

const BIOLEARN_DATA = {

    hemoglobin: {

        category: "RED BLOOD CELLS",

        name: "Hemoglobin",

        description:
            "Hemoglobin is the protein inside red blood cells that carries oxygen from the lungs to tissues throughout the body.",

        function:
            "It binds oxygen and transports it through the bloodstream.",

        why:
            "It is commonly measured to understand oxygen-carrying capacity and red blood cell status.",

        low:
            "Lower values can occur in several conditions, including different forms of anemia.",

        high:
            "Higher values can occur for several reasons and should be interpreted with the complete laboratory picture."

    },


    glucose: {

        category: "METABOLISM",

        name: "Glucose",

        description:
            "Glucose is the main circulating sugar used by cells as an energy source.",

        function:
            "It provides energy for cells, tissues and organs.",

        why:
            "Blood glucose testing helps evaluate how the body regulates sugar.",

        low:
            "Low glucose may occur when blood sugar falls below the expected level.",

        high:
            "High glucose may occur for several reasons and interpretation depends partly on whether the sample was fasting."

    },


    wbc: {

        category: "IMMUNE SYSTEM",

        name: "White Blood Cells",

        description:
            "White blood cells are immune-system cells that help protect the body from infections and other threats.",

        function:
            "They identify and respond to pathogens and other foreign material.",

        why:
            "The WBC count provides information about immune-system activity.",

        low:
            "A lower count can occur for several reasons and needs context from the complete report.",

        high:
            "A higher count can occur in response to several conditions, including infection and inflammation."

    },


    platelets: {

        category: "CLOTTING",

        name: "Platelets",

        description:
            "Platelets are small blood components that help the body form clots.",

        function:
            "They participate in stopping bleeding and maintaining normal clotting.",

        why:
            "The platelet count helps assess one part of the body's clotting system.",

        low:
            "Lower platelet levels may affect normal clot formation.",

        high:
            "Higher levels can have several causes and should be interpreted with other findings."

    },


    mcv: {

        category: "RED BLOOD CELLS",

        name: "MCV",

        description:
            "MCV represents the average size of red blood cells.",

        function:
            "It helps describe the size characteristics of circulating red blood cells.",

        why:
            "MCV can help classify certain patterns seen in red blood cell disorders.",

        low:
            "A low MCV indicates that red blood cells are smaller than the selected reference range.",

        high:
            "A high MCV indicates that red blood cells are larger than the selected reference range."

    },


    ldl: {

        category: "LIPID PROFILE",

        name: "LDL Cholesterol",

        description:
            "LDL is a type of cholesterol carried through the bloodstream.",

        function:
            "It transports cholesterol to tissues throughout the body.",

        why:
            "LDL is commonly considered when assessing cardiovascular risk.",

        low:
            "Lower LDL values are generally not interpreted in isolation.",

        high:
            "Higher LDL levels can be associated with increased cardiovascular risk."

    }

};


/* =========================================================
   5. SCROLL HELPER
========================================================= */

function scrollToSection(section) {

    if (!section) {
        return;
    }

    section.style.display = "block";

    setTimeout(function () {

        section.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 100);

}


/* =========================================================
   6. START BUTTONS
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        function () {

            scrollToSection(
                analyzeSection
            );

        }
    );

}


if (heroStartBtn) {

    heroStartBtn.addEventListener(
        "click",
        function () {

            scrollToSection(
                analyzeSection
            );

        }
    );

}


/* =========================================================
   7. HAVE REPORT
========================================================= */

if (haveReportBtn) {

    haveReportBtn.addEventListener(
        "click",
        function () {

            scrollToSection(
                analyzeSection
            );

        }
    );

}


/* =========================================================
   8. MANUAL REPORT BUTTON
========================================================= */

if (reportBtn) {

    reportBtn.addEventListener(
        "click",
        function () {

            scrollToSection(
                dataSection
            );

        }
    );

}


/* =========================================================
   9. UPLOAD BUTTON
========================================================= */

if (
    uploadReportBtn &&
    reportUpload
) {

    uploadReportBtn.addEventListener(
        "click",
        function () {

            reportUpload.click();

        }
    );

}


/* =========================================================
   10. SEX
========================================================= */

function getSelectedSex() {

    const selected =
        document.querySelector(
            'input[name="biologicalSex"]:checked'
        );

    if (!selected) {

        return "both";

    }

    const value =
        String(
            selected.value || ""
        )
        .toLowerCase()
        .trim();

    if (value === "male") {

        return "male";

    }

    if (value === "female") {

        return "female";

    }

    return "both";

}


/* =========================================================
   11. CLEAR INPUTS
========================================================= */

function clearInputValues() {

    Object.keys(
        PARAMETER_DEFINITIONS
    ).forEach(function (key) {

        const input =
            document.getElementById(
                key
            );

        if (input) {

            input.value = "";

        }

    });

}


/* =========================================================
   12. FILE SELECTION
========================================================= */

if (reportUpload) {

    reportUpload.addEventListener(
        "change",
        async function () {

            const file =
                reportUpload.files[0];

            if (!file) {

                return;

            }

            currentReportData = {};

            clearInputValues();

            if (uploadStatus) {

                uploadStatus.textContent =
                    "Preparing report...";

            }

            console.log(
                "FILE:",
                file.name
            );

            console.log(
                "TYPE:",
                file.type
            );

            console.log(
                "SIZE:",
                file.size
            );


            if (
                file.type === "application/pdf" ||
                file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                await readPDF(file);

                return;

            }


            if (
                file.type === "image/jpeg" ||
                file.type === "image/jpg" ||
                file.type === "image/png" ||
                file.type === "image/webp"
            ) {

                await readImageOCR(file);

                return;

            }


            if (uploadStatus) {

                uploadStatus.textContent =
                    "Please upload a PDF, JPG, PNG or WEBP report.";

            }

        }
    );

}


/* =========================================================
   13. PDF READER
========================================================= */

async function readPDF(file) {

    try {

        console.log(
            "STARTING PDF READER"
        );


        if (
            typeof window.pdfjsLib ===
            "undefined"
        ) {

            throw new Error(
                "PDF.js is not loaded."
            );

        }


        const arrayBuffer =
            await file.arrayBuffer();


        if (
            window.pdfjsLib
                .GlobalWorkerOptions
        ) {

            window.pdfjsLib
                .GlobalWorkerOptions
                .workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

        }


        const loadingTask =
            window.pdfjsLib.getDocument({

                data: arrayBuffer

            });


        const pdf =
            await loadingTask.promise;


        console.log(
            "PDF PAGES:",
            pdf.numPages
        );


        let fullText = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            if (uploadStatus) {

                uploadStatus.textContent =
                    `Reading page ${pageNumber} of ${pdf.numPages}...`;

            }


            const page =
                await pdf.getPage(
                    pageNumber
                );


            const textContent =
                await page.getTextContent();


            const pageText =
                reconstructPDFText(
                    textContent
                );


            console.log(
                `PAGE ${pageNumber}`,
                pageText
            );


            fullText +=
                pageText +
                "\n";

        }


        console.log(
            "COMPLETE PDF TEXT",
            fullText
        );


        extractParameters(
            fullText
        );


        const found =
            Object.keys(
                currentReportData
            ).length;


        if (found > 0) {

            showDetectedDataMessage(
                found,
                "PDF"
            );

            scrollToSection(
                dataSection
            );

            return;

        }


        if (uploadStatus) {

            uploadStatus.textContent =
                "No supported values found in PDF text. Trying OCR...";

        }


        await ocrPDFPages(pdf);

    }

    catch (error) {

        console.error(
            "PDF ERROR:",
            error
        );

        if (uploadStatus) {

            uploadStatus.textContent =
                "Unable to read PDF. Check the browser Console.";

        }

    }

}


/* =========================================================
   14. RECONSTRUCT PDF TEXT
========================================================= */

function reconstructPDFText(
    textContent
) {

    if (
        !textContent ||
        !Array.isArray(
            textContent.items
        )
    ) {

        return "";

    }


    const items =
        textContent.items

            .filter(function (item) {

                return (
                    item &&
                    typeof item.str ===
                        "string" &&
                    item.str.trim() !== ""
                );

            })

            .map(function (item) {

                const transform =
                    item.transform ||
                    [];

                return {

                    text:
                        item.str.trim(),

                    x:
                        Number(
                            transform[4]
                        ) || 0,

                    y:
                        Number(
                            transform[5]
                        ) || 0,

                    width:
                        Number(
                            item.width
                        ) || 0

                };

            });


    if (!items.length) {

        return "";

    }


    const lines = [];


    items.forEach(function (item) {

        let line =
            lines.find(function (existing) {

                return (
                    Math.abs(
                        existing.y -
                        item.y
                    ) < 3
                );

            });


        if (!line) {

            line = {

                y: item.y,

                items: []

            };

            lines.push(line);

        }


        line.items.push(item);

    });


    lines.sort(function (a, b) {

        return b.y - a.y;

    });


    return lines

        .map(function (line) {

            line.items.sort(
                function (a, b) {

                    return a.x - b.x;

                }
            );


            return line.items

                .map(function (item) {

                    return item.text;

                })

                .join(" ")

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();

        })

        .filter(Boolean)

        .join("\n");

}


/* =========================================================
   15. CLEAN TEXT
========================================================= */

function cleanExtractedText(text) {

    return String(
        text || ""
    )

        .replace(
            /\u00A0/g,
            " "
        )

        .replace(
            /\r/g,
            ""
        )

        .split("\n")

        .map(function (line) {

            return line

                .replace(
                    /[|]/g,
                    " "
                )

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();

        })

        .filter(Boolean)

        .join("\n");

}


/* =========================================================
   16. ESCAPE REGEX
========================================================= */

function escapeRegex(value) {

    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

}


/* =========================================================
   17. NORMALIZE TEXT
========================================================= */

function normalizeText(text) {

    return String(
        text || ""
    )

        .toLowerCase()

        .replace(
            /[\u2010-\u2015]/g,
            "-"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   18. ALIAS DETECTION
========================================================= */

function lineContainsAlias(
    line,
    definition
) {

    const normalized =
        normalizeText(
            line
        );


    const aliases =
        [
            ...definition.aliases
        ]
        .sort(function (a, b) {

            return (
                b.length -
                a.length
            );

        });


    return aliases.some(
        function (alias) {

            const pattern =
                new RegExp(
                    "(^|\\s)" +
                    escapeRegex(
                        normalizeText(
                            alias
                        )
                    ) +
                    "(?=\\s|:|=|-|$)",
                    "i"
                );


            return pattern.test(
                normalized
            );

        }
    );

}


/* =========================================================
   19. NUMBERS
========================================================= */

function getNumbersFromText(
    text
) {

    return (
        String(text || "")
            .replace(
                /,/g,
                ""
            )
            .match(
                /[-+]?\d+(?:\.\d+)?/g
            ) || []
    )

        .map(Number)

        .filter(
            Number.isFinite
        );

}


/* =========================================================
   20. VALIDATE PLAUSIBLE VALUE
========================================================= */

function isPlausibleValue(
    key,
    value
) {

    if (
        !Number.isFinite(
            value
        )
    ) {

        return false;

    }


    if (
        value < 0
    ) {

        return false;

    }


    switch (key) {

        case "hemoglobin":

            return (
                value >= 2 &&
                value <= 30
            );


        case "glucose":

            return (
                value >= 20 &&
                value <= 1000
            );


        case "wbc":

            return (
                value >= 100 &&
                value <= 100000
            );


        case "platelets":

            return (
                value >= 1000 &&
                value <= 5000000
            );


        case "mcv":

            return (
                value >= 30 &&
                value <= 150
            );


        case "ldl":

            return (
                value >= 1 &&
                value <= 1000
            );


        default:

            return true;

    }

}


/* =========================================================
   21. REMOVE REFERENCE RANGE
========================================================= */

function removeReferenceRanges(
    text
) {

    return String(
        text || ""
    )

        .replace(
            /\b\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?\b/g,
            " "
        )

        .replace(
            /\b\d+(?:\.\d+)?\s*(?:to)\s*\d+(?:\.\d+)?\b/gi,
            " "
        );

}


/* =========================================================
   22. SAME-LINE RESULT
========================================================= */

function extractSameLineResult(
    line,
    definition,
    key
) {

    let text =
        String(
            line || ""
        )

            .replace(
                /,/g,
                ""
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();


    const aliases =
        [
            ...definition.aliases
        ]
        .sort(function (a, b) {

            return (
                b.length -
                a.length
            );

        });


    let remainder =
        text;


    for (
        const alias of aliases
    ) {

        const aliasRegex =
            new RegExp(
                "^.*?" +
                escapeRegex(
                    alias
                ) +
                "(?=\\s|:|=|-|$)",
                "i"
            );


        if (
            aliasRegex.test(
                remainder
            )
        ) {

            remainder =
                remainder.replace(
                    aliasRegex,
                    ""
                );

            break;

        }

    }


    remainder =
        remainder.trim();


    /*
     * Strongest format:
     *
     * Hemoglobin : 13.9
     */

    const colonMatch =
        remainder.match(
            /:\s*(-?\d+(?:\.\d+)?)/ 
        );


    if (colonMatch) {

        const value =
            Number(
                colonMatch[1]
            );


        if (
            isPlausibleValue(
                key,
                value
            )
        ) {

            return value;

        }

    }


    /*
     * Explicit equals
     */

    const equalMatch =
        remainder.match(
            /=\s*(-?\d+(?:\.\d+)?)/
        );


    if (equalMatch) {

        const value =
            Number(
                equalMatch[1]
            );


        if (
            isPlausibleValue(
                key,
                value
            )
        ) {

            return value;

        }

    }


    /*
     * Remove reference ranges BEFORE
     * looking for ordinary numbers.
     */

    const withoutRanges =
        removeReferenceRanges(
            remainder
        );


    const numbers =
        getNumbersFromText(
            withoutRanges
        );


    if (!numbers.length) {

        return null;

    }


    /*
     * If exactly one plausible number
     * remains, use it.
     */

    const plausible =
        numbers.filter(
            function (value) {

                return isPlausibleValue(
                    key,
                    value
                );

            }
        );


    if (
        plausible.length === 1
    ) {

        return plausible[0];

    }


    /*
     * If unit appears, prefer the number
     * nearest to the unit.
     */

    const unitPatterns = {

        hemoglobin:
            /(?:g\/dL|g\/dl|gm\/dL|gm\/dl)\b/i,

        glucose:
            /mg\/dL|mg\/dl\b/i,

        wbc:
            /(?:\/uL|\/µL|\/cumm|cells\/uL|cells\/cumm)\b/i,

        platelets:
            /(?:\/uL|\/µL|\/cumm|cells\/uL|cells\/cumm)\b/i,

        mcv:
            /\bfL\b/i,

        ldl:
            /mg\/dL|mg\/dl\b/i

    };


    const unitPattern =
        unitPatterns[key];


    if (unitPattern) {

        const unitMatch =
            remainder.match(
                unitPattern
            );


        if (unitMatch) {

            const beforeUnit =
                remainder.slice(
                    0,
                    unitMatch.index
                );


            const beforeNumbers =
                getNumbersFromText(
                    removeReferenceRanges(
                        beforeUnit
                    )
                );


            const validBefore =
                beforeNumbers.filter(
                    function (value) {

                        return isPlausibleValue(
                            key,
                            value
                        );

                    }
                );


            if (
                validBefore.length
            ) {

                return (
                    validBefore[
                        validBefore.length - 1
                    ]
                );

            }

        }

    }


    return null;

}


/* =========================================================
   23. EXTRACT PARAMETER
========================================================= */

function extractParameter(
    lines,
    definition,
    key
) {

    if (
        !Array.isArray(lines)
    ) {

        return null;

    }


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const currentLine =
            lines[i];


        if (
            !lineContainsAlias(
                currentLine,
                definition
            )
        ) {

            continue;

        }


        console.log(
            "PARAMETER FOUND:",
            definition.name,
            currentLine
        );


        /*
         * CASE 1
         * Same line.
         */

        const sameLine =
            extractSameLineResult(
                currentLine,
                definition,
                key
            );


        if (
            sameLine !== null
        ) {

            console.log(
                "SAME LINE RESULT:",
                definition.name,
                sameLine
            );

            return sameLine;

        }


        /*
         * CASE 2
         *
         * Look at the following lines.
         */

        const maxLookAhead =
            Math.min(
                i + 8,
                lines.length
            );


        for (
            let j = i + 1;
            j < maxLookAhead;
            j++
        ) {

            const candidate =
                String(
                    lines[j] || ""
                ).trim();


            if (!candidate) {

                continue;

            }


            /*
             * Do not accidentally move
             * into the next parameter.
             */

            let belongsToAnotherParameter =
                false;


            for (
                const otherKey of
                Object.keys(
                    PARAMETER_DEFINITIONS
                )
            ) {

                if (
                    otherKey === key
                ) {

                    continue;

                }


                if (
                    lineContainsAlias(
                        candidate,
                        PARAMETER_DEFINITIONS[
                            otherKey
                        ]
                    )
                ) {

                    belongsToAnotherParameter =
                        true;

                    break;

                }

            }


            if (
                belongsToAnotherParameter
            ) {

                break;

            }


            /*
             * Ignore method lines.
             */

            if (
                /^method\b/i.test(
                    candidate
                )
            ) {

                continue;

            }


            /*
             * Strong result:
             *
             * : 13.9
             */

            const colon =
                candidate.match(
                    /^\s*:\s*(-?\d+(?:\.\d+)?)/
                );


            if (colon) {

                const value =
                    Number(
                        colon[1]
                    );


                if (
                    isPlausibleValue(
                        key,
                        value
                    )
                ) {

                    console.log(
                        "COLON RESULT:",
                        definition.name,
                        value
                    );

                    return value;

                }

            }


            /*
             * Loose colon.
             */

            const looseColon =
                candidate.match(
                    /:\s*(-?\d+(?:\.\d+)?)/
                );


            if (looseColon) {

                const value =
                    Number(
                        looseColon[1]
                    );


                if (
                    isPlausibleValue(
                        key,
                        value
                    )
                ) {

                    return value;

                }

            }


            /*
             * If line consists almost entirely
             * of one number, it is a strong result.
             */

            const cleanedCandidate =
                candidate
                    .replace(
                        /,/g,
                        ""
                    )
                    .trim();


            if (
                /^\d+(?:\.\d+)?$/.test(
                    cleanedCandidate
                )
            ) {

                const value =
                    Number(
                        cleanedCandidate
                    );


                if (
                    isPlausibleValue(
                        key,
                        value
                    )
                ) {

                    console.log(
                        "NUMBER LINE RESULT:",
                        definition.name,
                        value
                    );

                    return value;

                }

            }


            /*
             * Never use a reference range
             * as the laboratory result.
             */

            if (
                /\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?/
                    .test(candidate)
            ) {

                continue;

            }


            /*
             * Ignore obvious dates.
             */

            const numbers =
                getNumbersFromText(
                    candidate
                );


            if (
                numbers.length === 1
            ) {

                const value =
                    numbers[0];


                if (
                    value >= 1900 &&
                    value <= 2100
                ) {

                    continue;

                }


                /*
                 * Only accept nearby standalone
                 * values for laboratory reports.
                 */

                if (
                    isPlausibleValue(
                        key,
                        value
                    ) &&
                    /^[\s:=-]*\d+(?:\.\d+)?(?:\s*[a-zA-Zµ/]+)?\s*$/i
                        .test(candidate)
                ) {

                    return value;

                }

            }

        }

    }


    return null;

}


/* =========================================================
   24. SPECIAL VALUE CONVERSION
========================================================= */

function normalizeExtractedValue(
    key,
    value,
    text
) {

    if (
        key !== "platelets"
    ) {

        return value;

    }


    const normalized =
        String(
            text || ""
        )
        .replace(
            /,/g,
            ""
        );


    /*
     * 2.5 lakh
     */

    const lakhMatch =
        normalized.match(
            /(?:platelet count|platelets|plt)[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*(?:lakh|lac)\b/i
        );


    if (lakhMatch) {

        const lakh =
            Number(
                lakhMatch[1]
            );


        if (
            Number.isFinite(
                lakh
            )
        ) {

            return (
                lakh * 100000
            );

        }

    }


    /*
     * 250 x 10^3
     */

    const thousandMatch =
        normalized.match(
            /(?:platelet count|platelets|plt)[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*[x×]\s*10\s*(?:\^|\u00B3)?\s*3/i
        );


    if (thousandMatch) {

        const base =
            Number(
                thousandMatch[1]
            );


        if (
            Number.isFinite(
                base
            )
        ) {

            return (
                base * 1000
            );

        }

    }


    return value;

}


/* =========================================================
   25. EXTRACT ALL PARAMETERS
========================================================= */

function extractParameters(
    text
) {

    console.log(
        "================================"
    );

    console.log(
        "BIOCHECK PARAMETER EXTRACTION"
    );

    console.log(
        "================================"
    );


    const cleaned =
        cleanExtractedText(
            text
        );


    if (!cleaned) {

        currentReportData = {};

        return;

    }


    const lines =
        cleaned
            .split("\n")
            .map(function (line) {

                return line.trim();

            })
            .filter(Boolean);


    console.log(
        "REPORT LINES:",
        lines
    );


    const extracted = {};


    Object.keys(
        PARAMETER_DEFINITIONS
    ).forEach(function (key) {

        const definition =
            PARAMETER_DEFINITIONS[
                key
            ];


        let value =
            extractParameter(
                lines,
                definition,
                key
            );


        if (
            value !== null
        ) {

            value =
                normalizeExtractedValue(
                    key,
                    value,
                    cleaned
                );

        }


        if (
            value !== null &&
            Number.isFinite(
                value
            )
        ) {

            extracted[key] =
                value;


            console.log(
                "✓",
                definition.name,
                "=",
                value,
                definition.unit
            );

        }

        else {

            console.log(
                "—",
                definition.name,
                "NOT DETECTED"
            );

        }

    });


    currentReportData =
        extracted;


    /*
     * Fill manual fields.
     */

    Object.keys(
        extracted
    ).forEach(function (key) {

        const input =
            document.getElementById(
                key
            );


        if (input) {

            input.value =
                extracted[key];

        }

    });


    const found =
        Object.keys(
            extracted
        ).length;


    if (uploadStatus) {

        if (
            found === 6
        ) {

            uploadStatus.textContent =
                "Report read successfully ✓ All 6 supported parameters detected.";

        }

        else if (
            found > 0
        ) {

            uploadStatus.textContent =
                `Report read successfully ✓ ${found} supported parameter${found === 1 ? "" : "s"} detected.`;

        }

        else {

            uploadStatus.textContent =
                "Report read, but no supported laboratory parameters were detected.";

        }

    }


    if (dataSection) {

        dataSection.style.display =
            "block";

    }

}


/* =========================================================
   26. DETECTED MESSAGE
========================================================= */

function showDetectedDataMessage(
    count,
    source
) {

    if (!uploadStatus) {

        return;

    }


    uploadStatus.textContent =
        `${source} read successfully ✓ ${count} supported parameter${count === 1 ? "" : "s"} detected.`;

}


/* =========================================================
   27. IMAGE OCR
========================================================= */

async function readImageOCR(
    file
) {

    try {

        if (
            typeof window.Tesseract ===
            "undefined"
        ) {

            throw new Error(
                "Tesseract.js is not loaded."
            );

        }


        if (uploadStatus) {

            uploadStatus.textContent =
                "Starting image OCR...";

        }


        const worker =
            await Tesseract.createWorker(
                "eng",
                1,
                {

                    logger:
                        function (message) {

                            if (
                                uploadStatus &&
                                message.status
                            ) {

                                const progress =
                                    Math.round(
                                        (
                                            message.progress ||
                                            0
                                        ) * 100
                                    );


                                uploadStatus.textContent =
                                    `${message.status} ${progress}%`;

                            }

                        }

                }
            );


        const result =
            await worker.recognize(
                file
            );


        const text =
            result &&
            result.data
                ? result.data.text
                : "";


        console.log(
            "OCR TEXT:",
            text
        );


        await worker.terminate();


        extractParameters(
            text
        );


        const found =
            Object.keys(
                currentReportData
            ).length;


        if (found > 0) {

            showDetectedDataMessage(
                found,
                "IMAGE"
            );

        }


        scrollToSection(
            dataSection
        );

    }

    catch (error) {

        console.error(
            "OCR ERROR:",
            error
        );


        if (uploadStatus) {

            uploadStatus.textContent =
                "Unable to read image. Check the browser Console.";

        }

    }

}


/* =========================================================
   28. SCANNED PDF OCR
========================================================= */

async function ocrPDFPages(
    pdf
) {

    try {

        if (
            typeof window.Tesseract ===
            "undefined"
        ) {

            throw new Error(
                "Tesseract.js is not loaded."
            );

        }


        const worker =
            await Tesseract.createWorker(
                "eng",
                1,
                {

                    logger:
                        function (message) {

                            if (
                                uploadStatus &&
                                message.status
                            ) {

                                const progress =
                                    Math.round(
                                        (
                                            message.progress ||
                                            0
                                        ) * 100
                                    );


                                uploadStatus.textContent =
                                    `${message.status} ${progress}%`;

                            }

                        }

                }
            );


        let combinedText =
            "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            if (uploadStatus) {

                uploadStatus.textContent =
                    `OCR reading page ${pageNumber} of ${pdf.numPages}...`;

            }


            const page =
                await pdf.getPage(
                    pageNumber
                );


            const viewport =
                page.getViewport({

                    scale: 2

                });


            const canvas =
                document.createElement(
                    "canvas"
                );


            const context =
                canvas.getContext(
                    "2d"
                );


            canvas.width =
                viewport.width;


            canvas.height =
                viewport.height;


            await page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            }).promise;


            const result =
                await worker.recognize(
                    canvas
                );


            if (
                result &&
                result.data &&
                result.data.text
            ) {

                combinedText +=
                    result.data.text +
                    "\n";

            }

        }


        await worker.terminate();


        console.log(
            "SCANNED PDF OCR TEXT:",
            combinedText
        );


        extractParameters(
            combinedText
        );


        const found =
            Object.keys(
                currentReportData
            ).length;


        if (found > 0) {

            showDetectedDataMessage(
                found,
                "SCANNED PDF"
            );

        }


        scrollToSection(
            dataSection
        );

    }

    catch (error) {

        console.error(
            "SCANNED PDF OCR ERROR:",
            error
        );


        if (uploadStatus) {

            uploadStatus.textContent =
                "OCR could not process the scanned PDF.";

        }

    }

}


/* =========================================================
   29. REFERENCE RANGE
========================================================= */

function getReferenceRange(
    definition,
    sex
) {

    if (
        sex === "male"
    ) {

        return definition.male;

    }


    if (
        sex === "female"
    ) {

        return definition.female;

    }


    return {

        min:
            Math.min(
                definition.male.min,
                definition.female.min
            ),

        max:
            Math.max(
                definition.male.max,
                definition.female.max
            )

    };

}


/* =========================================================
   30. COLLECT DATA
========================================================= */

function collectAvailableData() {

    const data = {};


    Object.keys(
        PARAMETER_DEFINITIONS
    ).forEach(function (key) {

        const input =
            document.getElementById(
                key
            );


        if (!input) {

            return;

        }


        const raw =
            String(
                input.value || ""
            )
            .trim();


        if (!raw) {

            return;

        }


        const value =
            Number(
                raw.replace(
                    /,/g,
                    ""
                )
            );


        if (
            Number.isFinite(
                value
            ) &&
            value >= 0
        ) {

            data[key] =
                value;

        }

    });


    return data;

}


/* =========================================================
   31. PARAMETER EXPLANATION
========================================================= */

function getParameterExplanation(
    key,
    value,
    range,
    level
) {

    if (
        level === "LOW"
    ) {

        return (
            `${PARAMETER_DEFINITIONS[key].name} is below the selected reference range.`
        );

    }


    if (
        level === "HIGH"
    ) {

        return (
            `${PARAMETER_DEFINITIONS[key].name} is above the selected reference range.`
        );

    }


    return (
        `${PARAMETER_DEFINITIONS[key].name} is within the selected reference range.`
    );

}


/* =========================================================
   32. ANALYZE
========================================================= */

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
       async function () {

            const data =
                collectAvailableData();


            const sex =
                getSelectedSex();


            if (
                Object.keys(data)
                    .length === 0
            ) {

                alert(
                    "Please enter or upload at least one laboratory parameter."
                );

                return;

            }


            currentAnalysis = {

                parameters: [],

                normalCount: 0,

                monitorCount: 0,

                attentionCount: 0,

                awarenessScore: 0,

                sex: sex,

                overallResult: "",

                overallMessage: "",

                profile:
                    currentAnalysis.profile

            };


            if (parameterResults) {

                parameterResults.innerHTML =
                    "";

            }


            Object.keys(
                data
            ).forEach(function (key) {

                const definition =
                    PARAMETER_DEFINITIONS[
                        key
                    ];


                if (!definition) {

                    return;

                }


                const value =
                    data[key];


                const range =
                    getReferenceRange(
                        definition,
                        sex
                    );


                let status =
                    "normal";


                let statusText =
                    "WITHIN PROVIDED RANGE";


                let level =
                    "NORMAL";


                if (
                    value >= range.min &&
                    value <= range.max
                ) {

                    currentAnalysis
                        .normalCount++;

                }

                else {

                    let deviation;


                    if (
                        value < range.min
                    ) {

                        deviation =
                            (
                                (
                                    range.min -
                                    value
                                ) /
                                range.min
                            ) * 100;

                    }

                    else {

                        deviation =
                            (
                                (
                                    value -
                                    range.max
                                ) /
                                range.max
                            ) * 100;

                    }


                    if (
                        deviation <= 15
                    ) {

                        status =
                            "monitor";

                        statusText =
                            "MONITOR";

                        currentAnalysis
                            .monitorCount++;

                    }

                    else {

                        status =
                            "attention";

                        statusText =
                            "ATTENTION";

                        currentAnalysis
                            .attentionCount++;

                    }


                    level =
                        value < range.min
                            ? "LOW"
                            : "HIGH";

                }


                const explanation =
                    getParameterExplanation(
                        key,
                        value,
                        range,
                        level
                    );


                const rangeSize =
                    Math.max(
                        range.max -
                        range.min,
                        1
                    );


                const gaugeMin =
                    range.min -
                    rangeSize * 0.5;


                const gaugeMax =
                    range.max +
                    rangeSize * 0.5;


                let gaugePosition =
                    (
                        (
                            value -
                            gaugeMin
                        ) /
                        (
                            gaugeMax -
                            gaugeMin
                        )
                    ) * 100;


                gaugePosition =
                    Math.max(
                        3,
                        Math.min(
                            97,
                            gaugePosition
                        )
                    );


                const result = {

                    key:

                        key,

                    name:

                        definition.name,

                    value:

                        value,

                    unit:

                        definition.unit,

                    min:

                        range.min,

                    max:

                        range.max,

                    maleMin:

                        definition.male.min,

                    maleMax:

                        definition.male.max,

                    femaleMin:

                        definition.female.min,

                    femaleMax:

                        definition.female.max,

                    status:

                        status,

                    statusText:

                        statusText,

                    level:

                        level,

                    explanation:

                        explanation,

                    description:

                        definition.description,

                    gaugePosition:

                        gaugePosition

                };


                currentAnalysis
                    .parameters
                    .push(
                        result
                    );


                createParameterCard(
                    result
                );

            });


            const total =
                currentAnalysis
                    .parameters
                    .length;


            currentAnalysis.awarenessScore =
                total
                    ? Math.round(
                        (
                            currentAnalysis
                                .normalCount /
                            total
                        ) * 100
                    )
                    : 0;


            updateDashboardCounters();

            updateOverallSummary();

            updateReferencePanel();
                        await saveAnalysisToDatabase();


            if (dashboardSection) {

                dashboardSection.style.display =
                    "block";


                setTimeout(
                    function () {

                        dashboardSection
                            .scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "start"

                            });

                    },
                    300
                );

            }

        }
    );

}


/* =========================================================
   33. PARAMETER CARD
========================================================= */

function createParameterCard(
    parameter
) {

    if (!parameterResults) {

        return;

    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "parameter-card";


    const icon =
        parameter.status ===
        "normal"

            ? "🟢"

            : parameter.status ===
              "monitor"

                ? "🟡"

                : "🔴";


    card.innerHTML = `

        <div class="parameter-top">

            <span class="parameter-name">

                ${parameter.name}

            </span>

            <span class="parameter-status">

                ${icon}

            </span>

        </div>


        <div class="parameter-value">

            ${parameter.value}

            <span class="parameter-unit">

                ${parameter.unit}

            </span>

        </div>


        <div class="parameter-gauge">

            <div class="gauge-labels">

                <span>LOW</span>

                <span>NORMAL</span>

                <span>HIGH</span>

            </div>


            <div class="gauge-track">

                <div class="gauge-low"></div>

                <div class="gauge-normal"></div>

                <div class="gauge-high"></div>

                <div
                    class="gauge-marker"
                    style="left:${parameter.gaugePosition}%"
                >

                    <span>

                        ${parameter.value}

                    </span>

                </div>

            </div>

        </div>


        <div class="parameter-status">

            ${parameter.statusText}

        </div>


        <div class="parameter-reference">

            <div>

                Reference range used:

                <strong>

                    ${parameter.min}
                    –
                    ${parameter.max}
                    ${parameter.unit}

                </strong>

            </div>


            <div style="margin-top:8px;">

                Male:

                <strong>

                    ${parameter.maleMin}
                    –
                    ${parameter.maleMax}
                    ${parameter.unit}

                </strong>

            </div>


            <div style="margin-top:5px;">

                Female:

                <strong>

                    ${parameter.femaleMin}
                    –
                    ${parameter.femaleMax}
                    ${parameter.unit}

                </strong>

            </div>

        </div>


        <div class="parameter-explanation">

            ${parameter.explanation}

        </div>


        <div class="parameter-insight">

            <span class="insight-label">

                BIOLOGICAL INSIGHT

            </span>

            <p>

                ${parameter.description}

            </p>

        </div>

    `;


    parameterResults.appendChild(
        card
    );

}


/* =========================================================
   34. DASHBOARD COUNTERS
========================================================= */

function updateDashboardCounters() {

    const normal =
        document.getElementById(
            "normalCount"
        );

    const monitor =
        document.getElementById(
            "monitorCount"
        );

    const attention =
        document.getElementById(
            "attentionCount"
        );

    const awareness =
        document.getElementById(
            "awarenessScore"
        );


    if (normal) {

        normal.textContent =
            currentAnalysis
                .normalCount;

    }


    if (monitor) {

        monitor.textContent =
            currentAnalysis
                .monitorCount;

    }


    if (attention) {

        attention.textContent =
            currentAnalysis
                .attentionCount;

    }


    if (awareness) {

        awareness.textContent =
            currentAnalysis
                .awarenessScore;

    }

}


/* =========================================================
   35. OVERALL SUMMARY
========================================================= */

function updateOverallSummary() {

    const overallResult =
        document.getElementById(
            "overallResult"
        );

    const overallMessage =
        document.getElementById(
            "overallMessage"
        );


    if (
        !overallResult ||
        !overallMessage
    ) {

        return;

    }


    const total =
        currentAnalysis
            .parameters
            .length;


    if (
        currentAnalysis
            .attentionCount > 0
    ) {

        currentAnalysis
            .overallResult =
            "REVIEW RECOMMENDED";


        currentAnalysis
            .overallMessage =
            `${currentAnalysis.attentionCount} of ${total} analyzed parameter${total === 1 ? "" : "s"} require further attention.`;

    }

    else if (
        currentAnalysis
            .monitorCount > 0
    ) {

        currentAnalysis
            .overallResult =
            "MONITOR RESULTS";


        currentAnalysis
            .overallMessage =
            `${currentAnalysis.monitorCount} of ${total} analyzed parameter${total === 1 ? "" : "s"} are slightly outside the provided reference range.`;

    }

    else {

        currentAnalysis
            .overallResult =
            "WITHIN PROVIDED RANGES";


        currentAnalysis
            .overallMessage =
            `All ${total} analyzed parameter${total === 1 ? " is" : "s are"} within the provided reference ranges.`;

    }


    overallResult.textContent =
        currentAnalysis
            .overallResult;


    overallMessage.textContent =
        currentAnalysis
            .overallMessage;

}


/* =========================================================
   36. REFERENCE PANEL
========================================================= */

function updateReferencePanel() {

    const panel =
        document.querySelector(
            ".reference-info-panel"
        );


    if (!panel) {

        return;

    }


    const paragraph =
        panel.querySelector(
            ".reference-info-content p"
        );


    if (!paragraph) {

        return;

    }


    let sexText =
        "the broadest available prototype interval";


    if (
        currentAnalysis.sex ===
        "male"
    ) {

        sexText =
            "male prototype reference ranges";

    }


    if (
        currentAnalysis.sex ===
        "female"
    ) {

        sexText =
            "female prototype reference ranges";

    }


    paragraph.textContent =
        "BioCheck compares available laboratory values with " +
        sexText +
        ". Actual laboratory reference intervals can vary by laboratory, method, age and individual circumstances.";

}


/* =========================================================
   37. BIO LEARN BUTTON
========================================================= */

if (noReportBtn) {

    noReportBtn.addEventListener(
        "click",
        function () {

            if (
                bioLearnSection
            ) {

                bioLearnSection.style.display =
                    "block";

            }


            if (
                bioLearnContent
            ) {

                bioLearnContent.style.display =
                    "block";

            }


            renderBioLearn();

            scrollToSection(
                bioLearnSection
            );

        }
    );

}


/* =========================================================
   38. BIO LEARN RENDER
========================================================= */

function renderBioLearn() {

    if (!bioParameterGrid) {

        return;

    }


    bioParameterGrid.innerHTML =
        "";


    Object.keys(
        BIOLEARN_DATA
    ).forEach(function (key) {

        const item =
            BIOLEARN_DATA[key];


        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "bio-learn-card";


        card.innerHTML = `

            <span class="bio-category">

                ${item.category}

            </span>

            <strong>

                ${item.name}

            </strong>

            <p>

                ${item.description}

            </p>

        `;


        card.addEventListener(
            "click",
            function () {

                showBioDetail(
                    key
                );

            }
        );


        bioParameterGrid.appendChild(
            card
        );

    });

}


/* =========================================================
   39. BIO DETAIL
========================================================= */

function showBioDetail(
    key
) {

    const item =
        BIOLEARN_DATA[key];


    if (
        !item ||
        !bioParameterDetail
    ) {

        return;

    }


    bioParameterDetail.innerHTML = `

        <div class="bio-detail-inner">

            <span class="bio-category">

                ${item.category}

            </span>

            <h3>

                ${item.name}

            </h3>

            <p>

                ${item.description}

            </p>

            <h4>

                WHAT IT DOES

            </h4>

            <p>

                ${item.function}

            </p>

            <h4>

                WHY IT IS MEASURED

            </h4>

            <p>

                ${item.why}

            </p>

            <h4>

                WHEN IT IS LOW

            </h4>

            <p>

                ${item.low}

            </p>

            <h4>

                WHEN IT IS HIGH

            </h4>

            <p>

                ${item.high}

            </p>

        </div>

    `;


    bioParameterDetail.style.display =
        "block";

}


/* =========================================================
   40. CLOSE BIO DETAIL
========================================================= */

if (closeBioDetail) {

    closeBioDetail.addEventListener(
        "click",
        function () {

            if (
                bioParameterDetail
            ) {

                bioParameterDetail.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   41. NO REPORT PROFILE
========================================================= */

function collectProfileData() {

    const get =
        function (id) {

            const element =
                document.getElementById(
                    id
                );

            if (!element) {

                return "";

            }

            return String(
                element.value || ""
            ).trim();

        };


    const age =
        Number(
            get("profileAge")
        );


    const height =
        Number(
            get("profileHeight")
        );


    const weight =
        Number(
            get("profileWeight")
        );


    const sleep =
        Number(
            get("profileSleep")
        );


    const activity =
        get("profileActivity");


    const name =
        get("profileName");


    const sexElement =
        document.querySelector(
            'input[name="profileSex"]:checked'
        );


    const sex =
        sexElement
            ? String(
                sexElement.value
            )
                .toLowerCase()
                .trim()
            : "";


    if (
        !name ||
        !Number.isFinite(age) ||
        !Number.isFinite(height) ||
        !Number.isFinite(weight)
    ) {

        return null;

    }


    const heightMeters =
        height / 100;


    const bmi =
        weight /
        (
            heightMeters *
            heightMeters
        );


    let bmiCategory =
        "Healthy range";


    if (
        bmi < 18.5
    ) {

        bmiCategory =
            "Below healthy range";

    }

    else if (
        bmi >= 25 &&
        bmi < 30
    ) {

        bmiCategory =
            "Above healthy range";

    }

    else if (
        bmi >= 30
    ) {

        bmiCategory =
            "Higher BMI range";

    }


    let sleepScore =
        50;


    if (
        sleep >= 7 &&
        sleep <= 9
    ) {

        sleepScore =
            100;

    }

    else if (
        sleep >= 6
    ) {

        sleepScore =
            75;

    }

    else if (
        sleep > 0
    ) {

        sleepScore =
            40;

    }


    let activityScore =
        50;


    const activityText =
        activity.toLowerCase();


    if (
        activityText.includes(
            "high"
        ) ||
        activityText.includes(
            "very"
        )
    ) {

        activityScore =
            100;

    }

    else if (
        activityText.includes(
            "moderate"
        ) ||
        activityText.includes(
            "regular"
        )
    ) {

        activityScore =
            80;

    }

    else if (
        activityText.includes(
            "low"
        ) ||
        activityText.includes(
            "sedentary"
        )
    ) {

        activityScore =
            50;

    }


    let bmiScore =
        100;


    if (
        bmi < 18.5
    ) {

        bmiScore =
            70;

    }

    else if (
        bmi >= 25 &&
        bmi < 30
    ) {

        bmiScore =
            75;

    }

    else if (
        bmi >= 30
    ) {

        bmiScore =
            55;

    }


    const healthIndex =
        Math.round(
            (
                bmiScore +
                sleepScore +
                activityScore
            ) / 3
        );


    return {

        name,

        age,

        sex,

        height,

        weight,

        sleep,

        activity,

        bmi:

            Number(
                bmi.toFixed(1)
            ),

        bmiCategory,

        sleepScore,

        activityScore,

        bmiScore,

        healthIndex

    };

}


/* =========================================================
   42. BUILD PROFILE
========================================================= */

if (buildProfileBtn) {

    buildProfileBtn.addEventListener(
        "click",
      async function buildPersonalHealthProfile() {
        

            const profile =
                collectProfileData();


            if (!profile) {

                alert(
                    "Please enter your name, age, height and weight."
                );

                return;

            }
            await saveHealthProfileToDatabase(profile);


            currentAnalysis.profile =
                profile;


            renderProfileResult(
                profile
            );

        }
    );
if (healthPassportBtn) {

    healthPassportBtn.addEventListener(
        "click",
        function () {

            if (!healthPassportSection) {
                return;
            }

            healthPassportSection.style.display =
                "block";

            healthPassportSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            loadHealthPassport();

        }
    );

}
/* =========================================================
   LOAD HEALTH PASSPORT
========================================================= */

async function loadHealthPassport() {

    const userId =
        localStorage.getItem("bioQuestUserId");

    if (!userId) {

        alert(
            "Please log in first to access your Health Passport."
        );

        return;

    }

    try {

        const response = await fetch(
            `https://bioquest-5.onrender.com/api/users/${userId}/passport`
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Could not load Health Passport"
            );

        }

        const passport =
            data.healthPassport || {};


        /* -------------------------------
           FILL FORM
        -------------------------------- */

        const bloodGroup =
            document.getElementById(
                "passportBloodGroup"
            );

        const allergies =
            document.getElementById(
                "passportAllergies"
            );

        const medications =
            document.getElementById(
                "passportMedications"
            );

        const emergencyName =
            document.getElementById(
                "passportEmergencyName"
            );

        const emergencyPhone =
            document.getElementById(
                "passportEmergencyPhone"
            );

        const emergencyNotes =
            document.getElementById(
                "passportEmergencyNotes"
            );


        if (bloodGroup)
            bloodGroup.value =
                passport.bloodGroup || "";

        if (allergies)
            allergies.value =
                passport.allergies || "";

        if (medications)
            medications.value =
                passport.medications || "";

        if (emergencyName)
            emergencyName.value =
                passport.emergencyContactName || "";

        if (emergencyPhone)
            emergencyPhone.value =
                passport.emergencyContactPhone || "";

        if (emergencyNotes)
            emergencyNotes.value =
                passport.emergencyNotes || "";


        /* -------------------------------
           SHARING CHECKBOXES
        -------------------------------- */

        const shareBloodGroup =
            document.getElementById(
                "shareBloodGroup"
            );

        const shareAllergies =
            document.getElementById(
                "shareAllergies"
            );

        const shareMedications =
            document.getElementById(
                "shareMedications"
            );

        const shareEmergencyContact =
            document.getElementById(
                "shareEmergencyContact"
            );


        if (shareBloodGroup)
            shareBloodGroup.checked =
                Boolean(
                    passport.shareBloodGroup
                );

        if (shareAllergies)
            shareAllergies.checked =
                Boolean(
                    passport.shareAllergies
                );

        if (shareMedications)
            shareMedications.checked =
                Boolean(
                    passport.shareMedications
                );

        if (shareEmergencyContact)
            shareEmergencyContact.checked =
                Boolean(
                    passport.shareEmergencyContact
                );


        console.log(
            "✅ Health Passport loaded:",
            passport
        );


    } catch (error) {

        console.error(
            "❌ Health Passport load error:",
            error
        );

        alert(
            "Could not load your Health Passport."
        );

    }

}
/* =========================================================
   SAVE HEALTH PASSPORT
========================================================= */

if (saveHealthPassportBtn) {

    saveHealthPassportBtn.addEventListener(
        "click",
        async function savePassport() {

            const userId =
                localStorage.getItem("bioQuestUserId");

            if (!userId) {

                alert(
                    "Please log in first."
                );

                return;

            }


            /* -----------------------------------------
               GET FORM VALUES
            ----------------------------------------- */

            const bloodGroup =
                document.getElementById(
                    "passportBloodGroup"
                )?.value || "";

            const allergies =
                document.getElementById(
                    "passportAllergies"
                )?.value.trim() || "";

            const medications =
                document.getElementById(
                    "passportMedications"
                )?.value.trim() || "";

            const emergencyContactName =
                document.getElementById(
                    "passportEmergencyName"
                )?.value.trim() || "";

            const emergencyContactPhone =
                document.getElementById(
                    "passportEmergencyPhone"
                )?.value.trim() || "";

            const emergencyNotes =
                document.getElementById(
                    "passportEmergencyNotes"
                )?.value.trim() || "";


            /* -----------------------------------------
               SHARING SETTINGS
            ----------------------------------------- */

            const shareBloodGroup =
                document.getElementById(
                    "shareBloodGroup"
                )?.checked || false;

            const shareAllergies =
                document.getElementById(
                    "shareAllergies"
                )?.checked || false;

            const shareMedications =
                document.getElementById(
                    "shareMedications"
                )?.checked || false;

            const shareEmergencyContact =
                document.getElementById(
                    "shareEmergencyContact"
                )?.checked || false;


            /* -----------------------------------------
               BUTTON STATE
            ----------------------------------------- */

            const originalText =
                saveHealthPassportBtn.textContent;

            saveHealthPassportBtn.disabled =
                true;

            saveHealthPassportBtn.textContent =
                "SAVING...";


            try {

                const response =
                    await fetch(
                        `https://bioquest-5.onrender.com/api/users/${userId}/passport`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                bloodGroup,

                                allergies,

                                medications,

                                emergencyContactName,

                                emergencyContactPhone,

                                emergencyNotes,

                                shareBloodGroup,

                                shareAllergies,

                                shareMedications,

                                shareEmergencyContact

                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Could not save Health Passport"
                    );

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                saveHealthPassportBtn.textContent =
                    "✓ PASSPORT SAVED";

                saveHealthPassportBtn.style.background =
                    "linear-gradient(135deg, #76c7a3, #55ad86)";


                console.log(
                    "✅ Health Passport saved:",
                    data.healthPassport
                );


                setTimeout(
                    function () {

                        saveHealthPassportBtn.textContent =
                            originalText;

                        saveHealthPassportBtn.style.background =
                            "";

                        saveHealthPassportBtn.disabled =
                            false;

                    },
                    2500
                );


            } catch (error) {

                console.error(
                    "❌ Health Passport save error:",
                    error
                );


                saveHealthPassportBtn.disabled =
                    false;

                saveHealthPassportBtn.textContent =
                    originalText;


                alert(
                    "Could not save your Health Passport. Please try again."
                );

            }

        }
    );

}
}
/* =========================================================
   43. EDIT PROFILE
========================================================= */

if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        async function () {

            const userId =
                localStorage.getItem(
                    "bioQuestUserId"
                );

            if (!userId) {

                alert(
                    "Please login first."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `https://bioquest-5.onrender.com/api/users/${userId}`
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Could not load profile"
                    );

                }


                const user =
                    data.user;


                // Fill existing profile fields

                const nameInput =
                    document.getElementById(
                        "profileName"
                    );

                const ageInput =
                    document.getElementById(
                        "profileAge"
                    );

                const heightInput =
                    document.getElementById(
                        "profileHeight"
                    );

                const weightInput =
                    document.getElementById(
                        "profileWeight"
                    );


                if (nameInput) {

                    nameInput.value =
                        user.name || "";

                }


                if (ageInput) {

                    ageInput.value =
                        user.age || "";

                }


                if (heightInput) {

                    heightInput.value =
                        user.height || "";

                }


                if (weightInput) {

                    weightInput.value =
                        user.weight || "";

                }


                // Select gender

                if (user.gender) {

                    const genderInput =
                        document.querySelector(
                            `input[name="profileSex"][value="${user.gender}"]`
                        );

                    if (genderInput) {

                        genderInput.checked =
                            true;

                    }

                }


                // Scroll to profile form

                const profileForm =
                    document.getElementById(
                        "profile"
                    );


                if (profileForm) {

                    profileForm.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


                console.log(
                    "✅ Profile loaded for editing:",
                    user
                );

            } catch (error) {

                console.error(
                    "❌ Could not load profile:",
                    error
                );

                alert(
                    "Unable to load your profile."
                );

            }

        }
    );

}


/* =========================================================
   43. PROFILE RESULT
========================================================= */

function renderProfileResult(
    profile
) {

    if (!bioProfileResult) {

        return;

    }


    bioProfileResult.innerHTML = `

        <div class="profile-result-card">

            <span class="bio-category">

                PERSONAL BIOLOGICAL PROFILE

            </span>

            <h3>

                ${profile.name}

            </h3>

            <div class="profile-stat-grid">

                <div>

                    <small>AGE</small>

                    <strong>
                        ${profile.age}
                    </strong>

                </div>

                <div>

                    <small>HEIGHT</small>

                    <strong>
                        ${profile.height} cm
                    </strong>

                </div>

                <div>

                    <small>WEIGHT</small>

                    <strong>
                        ${profile.weight} kg
                    </strong>

                </div>

                <div>

                    <small>BMI</small>

                    <strong>
                        ${profile.bmi}
                    </strong>

                </div>

                <div>

                    <small>SLEEP</small>

                    <strong>
                        ${profile.sleep || "—"} h
                    </strong>

                </div>

                <div>

                    <small>HEALTH INDEX</small>

                    <strong>
                        ${profile.healthIndex}/100
                    </strong>

                </div>

            </div>


            <p>

                BMI category:
                <strong>
                    ${profile.bmiCategory}
                </strong>

            </p>


            <p>

                Your Health Index is an educational score based on the profile information provided. It is not a medical diagnosis.

            </p>

        </div>

    `;


    bioProfileResult.style.display =
        "block";


    bioProfileResult.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================================
   44. DOWNLOAD REPORT
========================================================= */

if (downloadReportBtn) {

    downloadReportBtn.addEventListener(
        "click",
        function () {

            if (
                typeof window.jspdf ===
                "undefined"
            ) {

                alert(
                    "PDF generator could not be loaded. Refresh the page and try again."
                );

                return;

            }


            const hasParameters =
                currentAnalysis
                    .parameters
                    .length > 0;


            const hasProfile =
                !!currentAnalysis.profile;


            if (
                !hasParameters &&
                !hasProfile
            ) {

                alert(
                    "Please complete an analysis before downloading the report."
                );

                return;

            }


            const {
                jsPDF
            } = window.jspdf;


            const doc =
                new jsPDF();


            const pageWidth =
                doc.internal
                    .pageSize
                    .getWidth();


            const pageHeight =
                doc.internal
                    .pageSize
                    .getHeight();


            const margin =
                18;


            let y =
                25;


            const date =
                new Date()
                    .toLocaleString();


            /*
             * HEADER
             */

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.setFontSize(
                24
            );


            doc.text(
                "BIOCHECK",
                margin,
                y
            );


            y += 7;


            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.setFontSize(
                9
            );


            doc.text(
                "BIOLOGICAL AWARENESS REPORT",
                margin,
                y
            );


            doc.setFontSize(
                8
            );


            doc.text(
                `Generated: ${date}`,
                pageWidth - margin,
                25,
                {
                    align: "right"
                }
            );


            y += 12;


            doc.line(
                margin,
                y,
                pageWidth - margin,
                y
            );


            y += 15;


            /*
             * PERSONAL PROFILE
             */

            if (
                currentAnalysis.profile
            ) {

                const profile =
                    currentAnalysis.profile;


                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.setFontSize(
                    13
                );


                doc.text(
                    "PERSONAL PROFILE",
                    margin,
                    y
                );


                y += 9;


                doc.setFont(
                    "helvetica",
                    "normal"
                );


                doc.setFontSize(
                    9
                );


                doc.text(
                    `Name: ${profile.name}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Age: ${profile.age}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Sex: ${profile.sex || "Not provided"}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Height: ${profile.height} cm`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Weight: ${profile.weight} kg`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `BMI: ${profile.bmi} (${profile.bmiCategory})`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Sleep: ${profile.sleep || "Not provided"} hours`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Physical activity: ${profile.activity || "Not provided"}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Health Index: ${profile.healthIndex}/100`,
                    margin,
                    y
                );


                y += 14;

            }


            /*
             * OVERALL
             */

            if (
                hasParameters
            ) {

                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.setFontSize(
                    13
                );


                doc.text(
                    "LABORATORY ANALYSIS",
                    margin,
                    y
                );


                y += 9;


                doc.setFontSize(
                    15
                );


                doc.text(
                    currentAnalysis
                        .overallResult,
                    margin,
                    y
                );


                y += 7;


                doc.setFont(
                    "helvetica",
                    "normal"
                );


                doc.setFontSize(
                    9
                );


                const summaryLines =
                    doc.splitTextToSize(
                        currentAnalysis
                            .overallMessage,
                        pageWidth -
                        margin * 2
                    );


                doc.text(
                    summaryLines,
                    margin,
                    y
                );


                y +=
                    summaryLines.length *
                    5 +
                    8;


                /*
                 * SUMMARY COUNTERS
                 */

                doc.text(
                    `Awareness Score: ${currentAnalysis.awarenessScore}%`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Normal: ${currentAnalysis.normalCount}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Monitor: ${currentAnalysis.monitorCount}`,
                    margin,
                    y
                );


                y += 6;


                doc.text(
                    `Attention: ${currentAnalysis.attentionCount}`,
                    margin,
                    y
                );


                y += 12;


                /*
                 * PARAMETERS
                 */

                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.setFontSize(
                    12
                );


                doc.text(
                    "PARAMETER RESULTS",
                    margin,
                    y
                );


                y += 9;


                currentAnalysis
                    .parameters
                    .forEach(
                        function (
                            parameter
                        ) {

                            if (
                                y >
                                pageHeight -
                                40
                            ) {

                                doc.addPage();

                                y = 25;

                            }


                            doc.setFont(
                                "helvetica",
                                "bold"
                            );


                            doc.setFontSize(
                                9
                            );


                            doc.text(
                                parameter.name,
                                margin,
                                y
                            );


                            y += 5;


                            doc.setFont(
                                "helvetica",
                                "normal"
                            );


                            doc.text(
                                `Value: ${parameter.value} ${parameter.unit}`,
                                margin,
                                y
                            );


                            y += 5;


                            doc.text(
                                `Reference: ${parameter.min} – ${parameter.max} ${parameter.unit}`,
                                margin,
                                y
                            );


                            y += 5;


                            doc.text(
                                `Status: ${parameter.statusText}`,
                                margin,
                                y
                            );


                            y += 5;


                            const explanation =
                                doc.splitTextToSize(
                                    parameter.explanation,
                                    pageWidth -
                                    margin * 2
                                );


                            doc.text(
                                explanation,
                                margin,
                                y
                            );


                            y +=
                                explanation.length *
                                4 +
                                7;


                            doc.line(
                                margin,
                                y,
                                pageWidth -
                                    margin,
                                y
                            );


                            y += 8;

                        }
                    );

            }


            /*
             * DISCLAIMER
             */

            if (
                y >
                pageHeight -
                45
            ) {

                doc.addPage();

                y = 25;

            }


            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.setFontSize(
                10
            );


            doc.text(
                "IMPORTANT",
                margin,
                y
            );


            y += 6;


            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.setFontSize(
                8
            );


            const disclaimer =
                "BioCheck is an educational and informational screening tool. " +
                "It does not provide a medical diagnosis and does not replace advice, " +
                "diagnosis or treatment from a qualified healthcare professional.";


            const disclaimerLines =
                doc.splitTextToSize(
                    disclaimer,
                    pageWidth -
                    margin * 2
                );


            doc.text(
                disclaimerLines,
                margin,
                y
            );


            /*
             * FOOTER
             */

            const pages =
                doc.internal
                    .getNumberOfPages();


            for (
                let page = 1;
                page <= pages;
                page++
            ) {

                doc.setPage(
                    page
                );


                doc.setFont(
                    "helvetica",
                    "normal"
                );


                doc.setFontSize(
                    7
                );


                doc.text(
                    "BIOCHECK • Biological awareness through accessible data",
                    margin,
                    pageHeight - 10
                );


                doc.text(
                    `Page ${page} of ${pages}`,
                    pageWidth - margin,
                    pageHeight - 10,
                    {
                        align:
                            "right"
                    }
                );

            }


            doc.save(
                "BioCheck_Biological_Report.pdf"
            );

        }
    );

}


/* =========================================================
   45. DEBUG
========================================================= */

console.log(
    "================================"
);

console.log(
    "BIOCHECK SCRIPT LOADED ✓"
);

console.log(
    "PDF extraction: ROBUST MODE ✓"
);

console.log(
    "IMAGE OCR: ENABLED ✓"
);

console.log(
    "BIO LEARN: ENABLED ✓"
);

console.log(
    "SUPPORTED PARAMETERS:",
    Object.keys(
        PARAMETER_DEFINITIONS
    )
);

console.log(
    "================================"
);
/* =========================================================
   PERSONAL HEALTH PROFILE
   Does NOT modify PDF / IMAGE readers
========================================================= */


const healthProfileSection =
    document.getElementById("healthProfileSection");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const profileStatus =
    document.getElementById("profileStatus");

const profileResults =
    document.getElementById("profileResults");


/* =========================================================
   PROFILE DATA
========================================================= */

let currentProfile = {

    name: "",
    age: null,
    sex: "",
    height: null,
    weight: null,
    activity: "",
    sleep: null,

    bmi: null,
    bmiCategory: "",
    activityScore: 0,
    sleepScore: 0,
    healthIndex: 0

};


/* =========================================================
   NO REPORT BUTTON — FIXED
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const noReportButton =
        document.getElementById("noReportBtn");

    const profileSection =
        document.getElementById("healthProfileSection");


    console.log(
        "NO REPORT BUTTON:",
        noReportButton
    );

    console.log(
        "HEALTH PROFILE SECTION:",
        profileSection
    );


    if (!noReportButton) {

        console.error(
            "ERROR: noReportBtn was not found in HTML."
        );

        return;

    }


    if (!profileSection) {

        console.error(
            "ERROR: healthProfileSection was not found in HTML."
        );

        return;

    }


    noReportButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            console.log(
                "================================"
            );

            console.log(
                "EXPLORE BIO LEARN CLICKED ✓"
            );

            console.log(
                "================================"
            );


            /* Show profile section */

            profileSection.style.display = "block";


            /* Scroll to profile */

            setTimeout(function () {

                profileSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);

        }
    );

});

/* =========================================================
   ACTIVITY SCORE
========================================================= */

function calculateActivityScore(activity) {

    switch (activity) {

        case "sedentary":
            return 30;

        case "light":
            return 50;

        case "moderate":
            return 70;

        case "active":
            return 85;

        case "very-active":
            return 100;

        default:
            return 0;

    }

}


/* =========================================================
   SLEEP SCORE
========================================================= */

function calculateSleepScore(hours) {

    if (!Number.isFinite(hours)) {
        return 0;
    }

    /*
     * 7–9 hours = optimal
     */

    if (hours >= 7 && hours <= 9) {
        return 100;
    }

    if (
        (hours >= 6 && hours < 7) ||
        (hours > 9 && hours <= 10)
    ) {
        return 80;
    }

    if (
        (hours >= 5 && hours < 6) ||
        (hours > 10 && hours <= 11)
    ) {
        return 60;
    }

    return 40;

}


/* =========================================================
   BMI CATEGORY
========================================================= */

function getBMICategory(bmi) {

    if (!Number.isFinite(bmi)) {
        return "Unable to calculate";
    }

    if (bmi < 18.5) {
        return "Underweight";
    }

    if (bmi < 25) {
        return "Healthy range";
    }

    if (bmi < 30) {
        return "Overweight";
    }

    return "Obesity range";

}


/* =========================================================
   BMI SCORE
========================================================= */

function calculateBMIScore(bmi) {

    if (!Number.isFinite(bmi)) {
        return 0;
    }

    /*
     * Gives the highest score to BMI
     * in the commonly used healthy range.
     */

    if (bmi >= 18.5 && bmi < 25) {
        return 100;
    }

    if (
        (bmi >= 17 && bmi < 18.5) ||
        (bmi >= 25 && bmi < 27.5)
    ) {
        return 80;
    }

    if (
        (bmi >= 16 && bmi < 17) ||
        (bmi >= 27.5 && bmi < 30)
    ) {
        return 60;
    }

    return 40;

}


/* =========================================================
   HEALTH INDEX
========================================================= */

function calculateHealthIndex(
    bmiScore,
    activityScore,
    sleepScore
) {

    /*
     * Simple wellness index.
     *
     * This is NOT a medical diagnosis.
     */

    return Math.round(
        (
            bmiScore +
            activityScore +
            sleepScore
        ) / 3
    );

}


/* =========================================================
   SAVE PROFILE
========================================================= */

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        function () {

            console.log(
                "================================"
            );

            console.log(
                "PERSONAL PROFILE"
            );

            console.log(
                "================================"
            );


            /* -----------------------------------------
               GET VALUES
            ----------------------------------------- */

            const nameInput =
                document.getElementById(
                    "profileName"
                );

            const ageInput =
                document.getElementById(
                    "profileAge"
                );

            const heightInput =
                document.getElementById(
                    "profileHeight"
                );

            const weightInput =
                document.getElementById(
                    "profileWeight"
                );

            const activityInput =
                document.getElementById(
                    "profileActivity"
                );

            const sleepInput =
                document.getElementById(
                    "profileSleep"
                );


            const name =
                nameInput
                    ? String(nameInput.value).trim()
                    : "";

          const age =
    ageInput && ageInput.value != null
        ? Number(String(ageInput.value).trim())
        : NaN;

            const height =
                heightInput
                    ? Number(heightInput.value)
                    : NaN;

            const weight =
                weightInput
                    ? Number(weightInput.value)
                    : NaN;

            const activity =
                activityInput
                    ? String(activityInput.value)
                    : "";

            const sleep =
                sleepInput
                    ? Number(sleepInput.value)
                    : NaN;


            /* -----------------------------------------
               GET SEX
            ----------------------------------------- */

            const selectedSex =
                document.querySelector(
                    'input[name="profileSex"]:checked'
                );


            const sex =
                selectedSex
                    ? selectedSex.value
                    : "";


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            if (
                !Number.isFinite(age) ||
                age < 1 ||
                age > 120
            ) {

                alert(
                    "Please enter a valid age."
                );

                return;

            }


            if (!sex) {

                alert(
                    "Please select your biological sex."
                );

                return;

            }


            if (
                !Number.isFinite(height) ||
                height < 50 ||
                height > 250
            ) {

                alert(
                    "Please enter a valid height."
                );

                return;

            }


            if (
                !Number.isFinite(weight) ||
                weight < 10 ||
                weight > 300
            ) {

                alert(
                    "Please enter a valid weight."
                );

                return;

            }


            if (!activity) {

                alert(
                    "Please select your physical activity level."
                );

                return;

            }


            if (
                !Number.isFinite(sleep) ||
                sleep < 0 ||
                sleep > 24
            ) {

                alert(
                    "Please enter your average sleep hours."
                );

                return;

            }


            /* -----------------------------------------
               BMI
            ----------------------------------------- */

            const heightMeters =
                height / 100;


            const bmi =
                weight /
                (
                    heightMeters *
                    heightMeters
                );


            const roundedBMI =
                Number(
                    bmi.toFixed(1)
                );


            /* -----------------------------------------
               SCORES
            ----------------------------------------- */

            const bmiScore =
                calculateBMIScore(
                    bmi
                );


            const activityScore =
                calculateActivityScore(
                    activity
                );


            const sleepScore =
                calculateSleepScore(
                    sleep
                );


            const healthIndex =
                calculateHealthIndex(
                    bmiScore,
                    activityScore,
                    sleepScore
                );


            /* -----------------------------------------
               SAVE PROFILE
            ----------------------------------------- */

            currentProfile = {

                name: name,

                age: age,

                sex: sex,

                height: height,

                weight: weight,

                activity: activity,

                sleep: sleep,

                bmi: roundedBMI,

                bmiCategory:
                    getBMICategory(bmi),

                activityScore:
                    activityScore,

                sleepScore:
                    sleepScore,

                healthIndex:
                    healthIndex

            };


            console.log(
                "PROFILE:",
                currentProfile
            );


            /* -----------------------------------------
               DISPLAY RESULTS
            ----------------------------------------- */

            const bmiElement =
                document.getElementById(
                    "profileBMI"
                );

            const bmiCategoryElement =
                document.getElementById(
                    "profileBMICategory"
                );

            const healthIndexElement =
                document.getElementById(
                    "profileHealthIndex"
                );

            const activityScoreElement =
                document.getElementById(
                    "profileActivityScore"
                );

            const sleepScoreElement =
                document.getElementById(
                    "profileSleepScore"
                );


            if (bmiElement) {

                bmiElement.textContent =
                    roundedBMI;

            }


            if (bmiCategoryElement) {

                bmiCategoryElement.textContent =
                    getBMICategory(bmi);

            }


            if (healthIndexElement) {

                healthIndexElement.textContent =
                    healthIndex;

            }


            if (activityScoreElement) {

                activityScoreElement.textContent =
                    activityScore;

            }


            if (sleepScoreElement) {

                sleepScoreElement.textContent =
                    sleepScore;

            }


            if (profileResults) {

                profileResults.style.display =
                    "grid";

            }


            if (profileStatus) {

                profileStatus.textContent =
                    "Profile calculated successfully ✓";

            }


            /* -----------------------------------------
               LOG
            ----------------------------------------- */

            console.log(
                "BMI:",
                roundedBMI
            );

            console.log(
                "BMI CATEGORY:",
                currentProfile.bmiCategory
            );

            console.log(
                "ACTIVITY SCORE:",
                activityScore
            );

            console.log(
                "SLEEP SCORE:",
                sleepScore
            );

            console.log(
                "HEALTH INDEX:",
                healthIndex
            );

        }
    );

}
/* =========================================================
   BIOQUEST HEALTH PROFILE
   HEALTH INDEX + DIRECT PDF DOWNLOAD
========================================================= */


/* ---------------------------------------------------------
   GET PROFILE VALUE
--------------------------------------------------------- */

function getProfileValue(ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            const value =
                element.value?.trim();

            if (value) {
                return value;
            }
        }
    }

    return "";
}


/* ---------------------------------------------------------
   GET BIOLOGICAL SEX
--------------------------------------------------------- */

function getBiologicalSex() {

    const selected =
        document.querySelector(
            'input[name="sex"]:checked'
        );

    if (selected) {
        return selected.value;
    }

    const male =
        document.getElementById("male");

    const female =
        document.getElementById("female");

    if (male && male.checked) {
        return "Male";
    }

    if (female && female.checked) {
        return "Female";
    }

    return "Not provided";
}


/* =========================================================
   CALCULATE BMI
========================================================= */

function calculateProfileBMI() {

    const height =
        parseFloat(
            getProfileValue([
                "profileHeight",
                "height"
            ])
        );

    const weight =
        parseFloat(
            getProfileValue([
                "profileWeight",
                "weight"
            ])
        );


    if (
        !height ||
        !weight ||
        height <= 0 ||
        weight <= 0
    ) {

        return null;
    }


    const heightMeters =
        height / 100;


    const bmi =
        weight /
        (
            heightMeters *
            heightMeters
        );


    return Number(
        bmi.toFixed(1)
    );
}


/* =========================================================
   BMI SCORE
========================================================= */

function getBMIScore(bmi) {

    if (bmi === null) {
        return 0;
    }


    /*
       Best scoring range:
       18.5 - 24.9
    */

    if (
        bmi >= 18.5 &&
        bmi <= 24.9
    ) {

        return 100;
    }


    if (
        bmi >= 17 &&
        bmi < 18.5
    ) {

        return 80;
    }


    if (
        bmi > 24.9 &&
        bmi <= 27.4
    ) {

        return 85;
    }


    if (
        bmi >= 15 &&
        bmi < 17
    ) {

        return 65;
    }


    if (
        bmi > 27.4 &&
        bmi <= 30
    ) {

        return 70;
    }


    return 50;
}


/* =========================================================
   SLEEP SCORE
========================================================= */

function getSleepScore(hours) {

    const sleep =
        parseFloat(hours);


    if (!sleep) {
        return 0;
    }


    if (
        sleep >= 7 &&
        sleep <= 9
    ) {

        return 100;
    }


    if (
        sleep >= 6 &&
        sleep < 7
    ) {

        return 80;
    }


    if (
        sleep > 9 &&
        sleep <= 10
    ) {

        return 85;
    }


    if (
        sleep >= 5 &&
        sleep < 6
    ) {

        return 65;
    }


    return 50;
}


/* =========================================================
   ACTIVITY SCORE
========================================================= */

function getActivityScore(activity) {

    if (!activity) {
        return 0;
    }


    const value =
        activity
            .toLowerCase()
            .trim();


    if (
        value.includes("very active") ||
        value.includes("high")
    ) {

        return 100;
    }


    if (
        value.includes("active") ||
        value.includes("moderate")
    ) {

        return 85;
    }


    if (
        value.includes("light")
    ) {

        return 70;
    }


    if (
        value.includes("sedentary") ||
        value.includes("low")
    ) {

        return 50;
    }


    return 70;
}


/* =========================================================
   HEALTH INDEX CALCULATION
========================================================= */

function calculateHealthIndex() {

    const bmi =
        calculateProfileBMI();


    const sleep =
        getProfileValue([
            "profileSleep",
            "sleep"
        ]);


    const activity =
        getProfileValue([
            "profileActivity",
            "activity"
        ]);


    const bmiScore =
        getBMIScore(bmi);


    const sleepScore =
        getSleepScore(sleep);


    const activityScore =
        getActivityScore(activity);


    /*
       Weighted Health Index

       BMI       = 40%
       Activity  = 30%
       Sleep     = 30%
    */

    let healthIndex =
        (
            bmiScore * 0.40
        ) +
        (
            activityScore * 0.30
        ) +
        (
            sleepScore * 0.30
        );


    /*
       If some values are missing,
       don't generate a fake score.
    */

    if (
        bmi === null ||
        !sleep ||
        !activity
    ) {

        return null;
    }


    healthIndex =
        Math.round(
            healthIndex
        );


    return healthIndex;
}


/* =========================================================
   DISPLAY HEALTH INDEX
========================================================= */

function updateHealthIndexDisplay() {

    const index =
        calculateHealthIndex();


    const scoreElement =
        document.querySelector(
            ".health-index-score"
        );


    const messageElement =
        document.querySelector(
            ".health-index-message"
        );


    const fillElement =
        document.querySelector(
            ".health-index-fill"
        );


    if (!scoreElement) {
        return;
    }


    if (index === null) {

        scoreElement.textContent =
            "--";

        if (messageElement) {

            messageElement.textContent =
                "Complete your profile to calculate your Health Index.";
        }

        if (fillElement) {

            fillElement.style.width =
                "0%";
        }

        return;
    }


    scoreElement.textContent =
        index;


    if (fillElement) {

        /*
           100 = completely filled
        */

        fillElement.style.width =
            `${100 - index}%`;
    }


    if (messageElement) {

        if (index >= 85) {

            messageElement.textContent =
                "Your profile shows strong overall wellness indicators.";

        } else if (index >= 70) {

            messageElement.textContent =
                "Your profile shows generally good wellness indicators.";

        } else if (index >= 55) {

            messageElement.textContent =
                "Some lifestyle indicators may benefit from improvement.";

        } else {

            messageElement.textContent =
                "Several wellness indicators may need attention.";
        }
    }


    /*
       Update BMI result card if it exists
    */

    const bmi =
        calculateProfileBMI();


    const bmiElements =
        document.querySelectorAll(
            ".bmi-value"
        );


    bmiElements.forEach(
        element => {

            element.textContent =
                bmi !== null
                    ? bmi
                    : "--";

        }
    );
}


/* =========================================================
   CONNECT CALCULATE BUTTON
========================================================= */

const healthProfileBtn =
    document.querySelector(
        ".health-profile-btn"
    );


if (healthProfileBtn) {

    healthProfileBtn.addEventListener(
        "click",
        function () {

            updateHealthIndexDisplay();

        }
    );
}


/* =========================================================
   ALSO UPDATE WHEN PROFILE CHANGES
========================================================= */

const profileInputs =
    document.querySelectorAll(
        ".health-profile-section input, .health-profile-section select"
    );


profileInputs.forEach(
    element => {

        element.addEventListener(
            "input",
            updateHealthIndexDisplay
        );

        element.addEventListener(
            "change",
            updateHealthIndexDisplay
        );

    }
);


/* =========================================================
   DOWNLOAD HEALTH PROFILE
========================================================= */

const downloadHealthProfileBtn =
    document.getElementById(
        "downloadHealthProfileBtn"
    );


if (downloadHealthProfileBtn) {

    downloadHealthProfileBtn.addEventListener(
        "click",
        function () {


            /* -----------------------------------------
               CALCULATE EVERYTHING FIRST
            ----------------------------------------- */

            const bmi =
                calculateProfileBMI();


            const healthIndex =
                calculateHealthIndex();


            /* -----------------------------------------
               CHECK REQUIRED DATA
            ----------------------------------------- */

            if (healthIndex === null) {

                alert(
                    "Please complete your Health Profile first."
                );

                return;
            }


            /* -----------------------------------------
               PROFILE DATA
            ----------------------------------------- */

            const name =
                getProfileValue([
                    "profileName",
                    "name"
                ]) ||
                "Not provided";


            const age =
                getProfileValue([
                    "profileAge",
                    "age"
                ]) ||
                "Not provided";


            const height =
                getProfileValue([
                    "profileHeight",
                    "height"
                ]) ||
                "Not provided";


            const weight =
                getProfileValue([
                    "profileWeight",
                    "weight"
                ]) ||
                "Not provided";


            const sleep =
                getProfileValue([
                    "profileSleep",
                    "sleep"
                ]) ||
                "Not provided";


            const activity =
                getProfileValue([
                    "profileActivity",
                    "activity"
                ]) ||
                "Not provided";


            const sex =
                getBiologicalSex();


            /* -----------------------------------------
               DATE
            ----------------------------------------- */

            const date =
                new Date().toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );


            /* -----------------------------------------
               CHECK jsPDF
            ----------------------------------------- */

            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                alert(
                    "PDF generator is not loaded. Please check the jsPDF script in index.html."
                );

                return;
            }


            const {
                jsPDF
            } = window.jspdf;


            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            /* =================================================
               PDF COLORS
            ================================================= */

            const ivory =
                [247, 240, 227];

            const dark =
                [48, 39, 30];

            const gold =
                [170, 119, 28];

            const muted =
                [117, 105, 91];

            const line =
                [218, 202, 172];


            /* =================================================
               PAGE BACKGROUND
            ================================================= */

            pdf.setFillColor(
                ...ivory
            );

            pdf.rect(
                0,
                0,
                210,
                297,
                "F"
            );


            /* =================================================
               OUTER BORDER
            ================================================= */

            pdf.setDrawColor(
                ...line
            );

            pdf.setLineWidth(
                0.4
            );

            pdf.roundedRect(
                12,
                12,
                186,
                273,
                4,
                4,
                "S"
            );


            /* =================================================
               HEADER
            ================================================= */

            pdf.setTextColor(
                ...gold
            );

            pdf.setFont(
                "times",
                "bold"
            );

            pdf.setFontSize(
                24
            );

            pdf.text(
                "BIOQUEST",
                105,
                30,
                {
                    align: "center"
                }
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                8
            );

            pdf.setTextColor(
                ...muted
            );

            pdf.text(
                "PERSONAL BIOLOGICAL PROFILE",
                105,
                37,
                {
                    align: "center"
                }
            );


            pdf.setDrawColor(
                ...line
            );

            pdf.line(
                30,
                43,
                180,
                43
            );


            /* =================================================
               TITLE
            ================================================= */

            pdf.setTextColor(
                ...dark
            );

            pdf.setFont(
                "times",
                "normal"
            );

            pdf.setFontSize(
                25
            );

            pdf.text(
                `${name}'s Health Profile`,
                25,
                58
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                8
            );

            pdf.setTextColor(
                ...muted
            );

            pdf.text(
                `Assessment date: ${date}`,
                25,
                65
            );


            /* =================================================
               PERSONAL INFORMATION
            ================================================= */

            pdf.setTextColor(
                ...gold
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(
                8
            );

            pdf.text(
                "PERSONAL INFORMATION",
                25,
                78
            );


            const rows = [

                [
                    "NAME",
                    name,
                    "AGE",
                    age
                ],

                [
                    "BIOLOGICAL SEX",
                    sex,
                    "HEIGHT",
                    `${height} cm`
                ],

                [
                    "WEIGHT",
                    `${weight} kg`,
                    "BMI",
                    bmi
                ],

                [
                    "PHYSICAL ACTIVITY",
                    activity,
                    "SLEEP",
                    `${sleep} hours/night`
                ]

            ];


            let y =
                85;


            rows.forEach(
                row => {

                    pdf.setFillColor(
                        255,
                        253,
                        247
                    );

                    pdf.setDrawColor(
                        ...line
                    );

                    pdf.roundedRect(
                        25,
                        y,
                        160,
                        19,
                        2,
                        2,
                        "FD"
                    );


                    pdf.setFont(
                        "helvetica",
                        "bold"
                    );

                    pdf.setFontSize(
                        7
                    );

                    pdf.setTextColor(
                        ...muted
                    );

                    pdf.text(
                        row[0],
                        31,
                        y + 7
                    );

                    pdf.text(
                        row[2],
                        108,
                        y + 7
                    );


                    pdf.setFont(
                        "times",
                        "normal"
                    );

                    pdf.setFontSize(
                        12
                    );

                    pdf.setTextColor(
                        ...dark
                    );

                    pdf.text(
                        String(row[1]),
                        31,
                        y + 14
                    );

                    pdf.text(
                        String(row[3]),
                        108,
                        y + 14
                    );


                    y += 23;

                }
            );


            /* =================================================
               HEALTH INDEX
            ================================================= */

            y += 8;


            pdf.setFillColor(
                255,
                252,
                244
            );

            pdf.setDrawColor(
                220,
                194,
                147
            );

            pdf.roundedRect(
                25,
                y,
                160,
                45,
                4,
                4,
                "FD"
            );


            pdf.setTextColor(
                ...muted
            );

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.setFontSize(
                7
            );

            pdf.text(
                "BIOQUEST HEALTH INDEX",
                105,
                y + 10,
                {
                    align: "center"
                }
            );


            pdf.setTextColor(
                ...gold
            );

            pdf.setFont(
                "times",
                "bold"
            );

            pdf.setFontSize(
                32
            );

            pdf.text(
                String(healthIndex),
                105,
                y + 27,
                {
                    align: "center"
                }
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                7
            );

            pdf.setTextColor(
                ...muted
            );

            let interpretation =
                "Wellness indicators calculated from your profile.";

            if (healthIndex >= 85) {

                interpretation =
                    "Strong overall wellness indicators.";

            } else if (healthIndex >= 70) {

                interpretation =
                    "Generally good wellness indicators.";

            } else if (healthIndex >= 55) {

                interpretation =
                    "Some wellness indicators may benefit from improvement.";

            } else {

                interpretation =
                    "Several wellness indicators may need attention.";
            }


            pdf.text(
                interpretation,
                105,
                y + 37,
                {
                    align: "center"
                }
            );


            /* =================================================
               FOOTER
            ================================================= */

            pdf.setDrawColor(
                ...line
            );

            pdf.line(
                25,
                258,
                185,
                258
            );


            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                7
            );

            pdf.setTextColor(
                ...muted
            );

            pdf.text(
                "BIOQUEST — PERSONAL BIOLOGICAL ANALYSIS",
                105,
                267,
                {
                    align: "center"
                }
            );


            pdf.text(
                "For educational and informational purposes only. Not a medical diagnosis.",
                105,
                273,
                {
                    align: "center"
                }
            );


            /* =================================================
               DIRECT DOWNLOAD
            ================================================= */

            const safeName =
                name
                    .replace(
                        /[^a-z0-9]/gi,
                        "_"
                    )
                    .replace(
                        /_+/g,
                        "_"
                    );


            pdf.save(
                `BioQuest_Health_Profile_${safeName}.pdf`
            );

        }
    );

}
/* =========================================================
   BIOQUEST GOAL TRACKER
========================================================= */

(function () {

    const goalType = document.getElementById("goalType");
    const goalTarget = document.getElementById("goalTarget");
    const goalUnit = document.getElementById("goalUnit");
    const createGoalBtn = document.getElementById("createGoalBtn");

    const goalsGrid = document.getElementById("goalsGrid");
    const goalsEmpty = document.getElementById("goalsEmpty");


    if (
        !goalType ||
        !goalTarget ||
        !goalUnit ||
        !createGoalBtn ||
        !goalsGrid
    ) {
        return;
    }


    let goals = JSON.parse(
        localStorage.getItem("bioquestGoals") || "[]"
    );


    const goalNames = {

        sleep: "Sleep",

        activity: "Physical Activity",

        weight: "Weight",

        health: "Health Tracking"

    };


    function saveGoals() {

        localStorage.setItem(
            "bioquestGoals",
            JSON.stringify(goals)
        );

    }


    function calculateProgress(current, target) {

        if (!target || target <= 0) {
            return 0;
        }

        let percentage =
            (Number(current) / Number(target)) * 100;

        return Math.min(
            Math.max(percentage, 0),
            100
        );

    }


    function renderGoals() {

        goalsGrid.innerHTML = "";


        if (goals.length === 0) {

            goalsEmpty.style.display = "block";

            return;

        }


        goalsEmpty.style.display = "none";


        goals.forEach(function (goal, index) {

            const progress =
                calculateProgress(
                    goal.current,
                    goal.target
                );


            const card =
                document.createElement("article");

            card.className = "goal-card";


            card.innerHTML = `

                <span class="goal-card-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div class="goal-card-type">
                    ${goalNames[goal.type] || "PERSONAL GOAL"}
                </div>

                <h3>
                    ${goal.title}
                </h3>

                <div class="goal-target">
                    Target:
                    <strong>
                        ${goal.target}
                        ${goal.unit}
                    </strong>
                </div>

                <div class="goal-progress-header">

                    <span>
                        Current:
                        ${goal.current}
                        ${goal.unit}
                    </span>

                    <span class="goal-progress-percent">
                        ${Math.round(progress)}%
                    </span>

                </div>

                <div class="goal-progress">

                    <div
                        class="goal-progress-bar"
                        style="width:${progress}%"
                    ></div>

                </div>

                <div class="goal-update-row">

                    <input
                        type="number"
                        class="goal-current-input"
                        placeholder="Update"
                        min="0"
                        step="0.1"
                    >

                    <button
                        type="button"
                        class="goal-update-btn"
                    >
                        UPDATE
                    </button>

                </div>

                <button
                    type="button"
                    class="goal-delete"
                >
                    REMOVE GOAL
                </button>

            `;


            const updateInput =
                card.querySelector(
                    ".goal-current-input"
                );


            const updateButton =
                card.querySelector(
                    ".goal-update-btn"
                );


            const deleteButton =
                card.querySelector(
                    ".goal-delete"
                );


            updateButton.addEventListener(
                "click",
                function () {

                    const value =
                        Number(
                            updateInput.value
                        );


                    if (
                        updateInput.value === "" ||
                        Number.isNaN(value) ||
                        value < 0
                    ) {

                        alert(
                            "Please enter a valid progress value."
                        );

                        return;

                    }


                    goals[index].current = value;

                    saveGoals();

                    renderGoals();

                }
            );


            deleteButton.addEventListener(
                "click",
                function () {

                    const confirmed =
                        confirm(
                            "Remove this goal?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    goals.splice(index, 1);

                    saveGoals();

                    renderGoals();

                }
            );


            goalsGrid.appendChild(card);

        });

    }


    createGoalBtn.addEventListener(
        "click",
        function () {

            const type =
                goalType.value;

            const target =
                Number(
                    goalTarget.value
                );

            const unit =
                goalUnit.value.trim();


            if (!type) {

                alert(
                    "Please select a goal."
                );

                return;

            }


            if (
                goalTarget.value === "" ||
                Number.isNaN(target) ||
                target <= 0
            ) {

                alert(
                    "Please enter a valid target."
                );

                return;

            }


            if (!unit) {

                alert(
                    "Please enter a unit."
                );

                return;

            }


            const newGoal = {

                type: type,

                title:
                    goalNames[type] ||
                    "Personal Goal",

                target: target,

                current: 0,

                unit: unit

            };


            goals.push(newGoal);

            saveGoals();

            renderGoals();


            goalType.value = "";

            goalTarget.value = "";

            goalUnit.value = "";

        }
    );


    renderGoals();

})();
/* =========================================================
   BIOQUEST HEALTH TRENDS
========================================================= */

(function () {

    const parameterSelect =
        document.getElementById("trendParameter");

    const parameterName =
        document.getElementById("trendParameterName");

    const graph =
        document.getElementById("trendGraph");

    const line =
        document.getElementById("trendLine");

    const pointsGroup =
        document.getElementById("trendPoints");

    const latestValue =
        document.getElementById("trendLatestValue");

    const direction =
        document.getElementById("trendDirection");

    const maxLabel =
        document.getElementById("trendMax");

    const midLabel =
        document.getElementById("trendMid");


    if (
        !parameterSelect ||
        !parameterName ||
        !graph ||
        !line ||
        !pointsGroup
    ) {

        return;

    }


    /* ---------------------------------------------------------
       SAMPLE DATA
    --------------------------------------------------------- */

    const trendData = {

        hemoglobin: {

            name: "Hemoglobin",

            unit: "g/dL",

            values: [
                12.1,
                12.4,
                13.0,
                13.2
            ]

        },


        glucose: {

            name: "Glucose",

            unit: "mg/dL",

            values: [
                102,
                98,
                96,
                94
            ]

        },


        wbc: {

            name: "WBC",

            unit: "/µL",

            values: [
                6800,
                7200,
                7000,
                7100
            ]

        },


        platelets: {

            name: "Platelets",

            unit: "/µL",

            values: [
                230000,
                245000,
                250000,
                255000
            ]

        },


        mcv: {

            name: "MCV",

            unit: "fL",

            values: [
                86,
                87,
                88,
                89
            ]

        },


        ldl: {

            name: "LDL",

            unit: "mg/dL",

            values: [
                152,
                148,
                142,
                138
            ]

        }

    };


    /* ---------------------------------------------------------
       DRAW GRAPH
    --------------------------------------------------------- */

    function drawGraph(parameter) {

        const data =
            trendData[parameter];

        if (!data) {
            return;
        }


        const values =
            data.values;


        parameterName.textContent =
            data.name;


        latestValue.textContent =
            values[values.length - 1] +
            " " +
            data.unit;


        /* GRAPH SCALE */

        const minimum =
            Math.min(...values);

        const maximum =
            Math.max(...values);


        const padding =
            (maximum - minimum || 1) * 0.25;


        const min =
            minimum - padding;

        const max =
            maximum + padding;


        maxLabel.textContent =
            Math.round(max);


        midLabel.textContent =
            Math.round(
                (max + min) / 2
            );


        /* POINTS */

        const graphWidth = 700;

        const graphHeight = 250;

        const leftPadding = 20;

        const rightPadding = 20;

        const usableWidth =
            graphWidth -
            leftPadding -
            rightPadding;


        const points =
            values.map(
                function (value, index) {

                    const x =
                        leftPadding +
                        (
                            index /
                            (values.length - 1)
                        ) *
                        usableWidth;


                    const normalized =
                        (
                            value - min
                        ) /
                        (
                            max - min
                        );


                    const y =
                        graphHeight -
                        (
                            normalized *
                            graphHeight
                        );


                    return {
                        x: x,
                        y: y
                    };

                }
            );


        /* LINE */

        line.setAttribute(

            "points",

            points
                .map(
                    point =>
                        `${point.x},${point.y}`
                )
                .join(" ")

        );


        /* POINTS */

        pointsGroup.innerHTML = "";


        points.forEach(
            function (point) {

                const circle =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );


                circle.setAttribute(
                    "cx",
                    point.x
                );


                circle.setAttribute(
                    "cy",
                    point.y
                );


                circle.setAttribute(
                    "r",
                    "5"
                );


                circle.setAttribute(
                    "class",
                    "trend-point"
                );


                pointsGroup.appendChild(
                    circle
                );

            }
        );


        /* TREND */

        const first =
            values[0];

        const last =
            values[values.length - 1];


        const difference =
            last - first;


        if (
            Math.abs(difference) <
            Math.abs(first) * 0.02
        ) {

            direction.textContent =
                "→ Stable";

        }
        else if (
            difference > 0
        ) {

            direction.textContent =
                "↑ Increasing";

        }
        else {

            direction.textContent =
                "↓ Decreasing";

        }

    }


    /* ---------------------------------------------------------
       CHANGE PARAMETER
    --------------------------------------------------------- */

    parameterSelect.addEventListener(
        "change",
        function () {

            drawGraph(
                this.value
            );

        }
    );


    /* INITIAL */

    drawGraph(
        parameterSelect.value
    );


})();
/* =========================================================
   BIOLEARN HEADER BUTTON
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const bioLearnButtons =
        document.querySelectorAll(
            '#bioLearnBtn, .biolearn-btn, [data-biolearn]'
        );

    bioLearnButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const bioLearnSection =
                document.getElementById("bioLearnSection");

            if (bioLearnSection) {

                bioLearnSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

});
/* =========================================================
   WHY BIOQUEST — SCROLL ANIMATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const section = document.getElementById("whyBioQuest");

    if (!section) return;

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    section.classList.add("visible");

                }

            });

        },

        {
            threshold: 0.18
        }

    );

    observer.observe(section);

});
/* =========================================================
   BIOQUEST — HEART & CIRCULATION PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    const heartCard =
        document.querySelector(
            '.bio-learn-card[data-topic="heart"]'
        );


    const bioLearnSection =
        document.getElementById(
            "bioLearnSection"
        );


    const heartPage =
        document.getElementById(
            "heartPage"
        );


    const heartBack =
        document.getElementById(
            "heartBack"
        );


    const heartBackBottom =
        document.getElementById(
            "heartBackBottom"
        );


    /* SAFETY CHECK */

    if (
        !heartCard ||
        !bioLearnSection ||
        !heartPage
    ) {

        console.warn(
            "BioQuest: Heart & Circulation elements not found."
        );

        return;

    }


    /* =====================================================
       OPEN HEART PAGE
    ====================================================== */

    heartCard.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            /*
             * Hide BioLearn cards.
             */

            bioLearnSection.style.display =
                "none";


            /*
             * Show Heart page.
             */

            heartPage.style.display =
                "block";


            /*
             * Trigger animation.
             */

            requestAnimationFrame(
                function () {

                    heartPage.classList.add(
                        "active"
                    );

                }
            );


            /*
             * IMPORTANT:
             *
             * We DO NOT use:
             *
             * window.scrollTo(0, 0)
             *
             * here.
             *
             * The page opens exactly where
             * the user clicked.
             */

            document.body.classList.add(
                "bio-topic-open"
            );

        }
    );


    /* =====================================================
       CLOSE HEART PAGE
    ====================================================== */

    function closeHeartPage() {


        heartPage.classList.remove(
            "active"
        );


        setTimeout(
            function () {

                heartPage.style.display =
                    "none";


                bioLearnSection.style.display =
                    "";


                document.body.classList.remove(
                    "bio-topic-open"
                );


                /*
                 * Return directly to the
                 * BioLearn section.
                 */

                bioLearnSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            300
        );

    }


    /* TOP BACK BUTTON */

    if (heartBack) {

        heartBack.addEventListener(
            "click",
            closeHeartPage
        );

    }


    /* BOTTOM BACK BUTTON */

    if (heartBackBottom) {

        heartBackBottom.addEventListener(
            "click",
            closeHeartPage
        );

    }


});
/* =========================================================
   BRAIN & NERVOUS SYSTEM — OPEN TOPIC
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const brainTopicPage =
        document.getElementById("brainTopicPage");

    const brainBackBtn =
        document.getElementById("brainBackBtn");

    /*
       Find the Brain & Nervous System card
       using its existing data-topic attribute.
    */

    const brainCard =
        document.querySelector(
            '.bio-learn-card[data-topic="brain"]'
        );


    /* OPEN BRAIN PAGE */

    if (brainCard) {

        brainCard.addEventListener("click", function (event) {

            event.preventDefault();

            /*
               Hide BioLearn
            */

            const bioLearnSection =
                document.getElementById("bioLearnSection");

            if (bioLearnSection) {
                bioLearnSection.style.display = "none";
            }


            /*
               Hide other topic pages if you have them
            */

            const allTopicPages =
                document.querySelectorAll(".bio-topic-page");

            allTopicPages.forEach(function (page) {

                page.style.display = "none";

            });


            /*
               Show Brain page
            */

            brainTopicPage.style.display = "block";


            /*
               DIRECTLY move to Brain page
               instead of going to website top
            */

            requestAnimationFrame(function () {

                brainTopicPage.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

    }


    /* BACK TO BIOLEARN */

    if (brainBackBtn) {

        brainBackBtn.addEventListener("click", function () {

            brainTopicPage.style.display = "none";


            const bioLearnSection =
                document.getElementById("bioLearnSection");

            if (bioLearnSection) {

                bioLearnSection.style.display = "block";

                requestAnimationFrame(function () {

                    bioLearnSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                });

            }

        });

    }

});
/* =====================================================
   BLOOD & HEMATOLOGY BIOLEARN
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const bloodCard =
        document.querySelector(
            '.bio-learn-card[data-topic="blood"]'
        );

    const bloodSection =
        document.getElementById("bloodTopic");


    /* -----------------------------------------------
       CHECK ELEMENTS
    ------------------------------------------------ */

    if (!bloodCard || !bloodSection) {

        console.log("Blood & Hematology card or section not found.");

        return;
    }


    /* -----------------------------------------------
       OPEN BLOOD & HEMATOLOGY
    ------------------------------------------------ */

    bloodCard.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();


        /* Hide every other BioLearn detail page */

        document
            .querySelectorAll(".bio-topic-detail")
            .forEach(function (section) {

                section.classList.remove(
                    "bio-topic-active"
                );

            });


        /* Also hide older topic-page sections */

        document
            .querySelectorAll(".bio-topic-page")
            .forEach(function (section) {

                section.classList.remove(
                    "active"
                );

            });


        /* Open Blood & Hematology */

        bloodSection.classList.add(
            "bio-topic-active"
        );


        /* Directly move to the Blood section */

        setTimeout(function () {

            bloodSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 50);

    });

});


/* =====================================================
   CLOSE BLOOD & HEMATOLOGY
===================================================== */

function closeBloodTopic() {

    const bloodSection =
        document.getElementById("bloodTopic");


    if (bloodSection) {

        bloodSection.classList.remove(
            "bio-topic-active"
        );

    }


    /* Return to BioLearn */

    const bioLearnSection =
        document.getElementById("bioLearnSection");


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    }

}
/* =====================================================
   BIOLEARN TOPIC NAVIGATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const bloodCard =
        document.querySelector('.bio-learn-card[data-topic="blood"]');

    const bloodTopic =
        document.getElementById("bloodTopic");


    if (bloodCard && bloodTopic) {

        bloodCard.addEventListener("click", function (event) {

            event.preventDefault();

            /*
             * Hide other BioLearn cards/sections
             * if necessary.
             */

            bloodTopic.classList.add("active");


            /*
             * Directly move to Blood & Hematology.
             * This prevents the page from jumping
             * to the top first.
             */

            setTimeout(function () {

                bloodTopic.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 50);

        });

    }

});


/* =====================================================
   CLOSE TOPIC
===================================================== */

function closeBioTopic() {

    const bloodTopic =
        document.getElementById("bloodTopic");

    const bioLearnSection =
        document.getElementById("bioLearnSection");


    if (bloodTopic) {

        bloodTopic.classList.remove("active");

    }


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 50);

    }

}
/* =====================================================
   MICROBIOLOGY BIOLEARN
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* -------------------------------------------------
       MICROBIOLOGY CARD
    ------------------------------------------------- */

    const microbiologyCard =
        document.querySelector(
            '.bio-learn-card[data-topic="microbiology"]'
        );


    /* -------------------------------------------------
       MICROBIOLOGY INFORMATION PAGE
    ------------------------------------------------- */

    const microbiologySection =
        document.getElementById(
            "microbiologyTopic"
        );


    /* -------------------------------------------------
       CHECK
    ------------------------------------------------- */

    if (
        !microbiologyCard ||
        !microbiologySection
    ) {

        console.log(
            "Microbiology card or section not found."
        );

        return;

    }


    /* =================================================
       OPEN MICROBIOLOGY
    ================================================= */

    microbiologyCard.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /* -----------------------------------------
               HIDE ALL OTHER BIOLEARN DETAIL PAGES
            ----------------------------------------- */

            document
                .querySelectorAll(
                    ".bio-topic-detail"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "bio-topic-active"
                    );

                });


            /* -----------------------------------------
               ALSO CLOSE OLDER TOPIC SYSTEM
            ----------------------------------------- */

            document
                .querySelectorAll(
                    ".bio-topic-page"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "active"
                    );

                });


            /* -----------------------------------------
               OPEN MICROBIOLOGY
            ----------------------------------------- */

            microbiologySection.classList.add(
                "bio-topic-active"
            );


            /* -----------------------------------------
               DIRECT SCROLL
            ----------------------------------------- */

            setTimeout(function () {

                microbiologySection.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 50);

        }
    );

});


/* =====================================================
   CLOSE MICROBIOLOGY
===================================================== */

function closeMicrobiologyTopic() {

    const microbiologySection =
        document.getElementById(
            "microbiologyTopic"
        );


    if (microbiologySection) {

        microbiologySection.classList.remove(
            "bio-topic-active"
        );

    }


    /* -----------------------------------------------
       RETURN TO BIOLEARN
    ------------------------------------------------ */

    const bioLearnSection =
        document.getElementById(
            "bioLearnSection"
        );


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}
/* =====================================================
   RESPIRATORY SYSTEM BIOLEARN
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* -------------------------------------------------
       RESPIRATORY CARD
    ------------------------------------------------- */

    const respiratoryCard =
        document.querySelector(
            '.bio-learn-card[data-topic="respiratory"]'
        );


    /* -------------------------------------------------
       RESPIRATORY INFORMATION PAGE
    ------------------------------------------------- */

    const respiratorySection =
        document.getElementById(
            "respiratoryTopic"
        );


    /* -------------------------------------------------
       CHECK ELEMENTS
    ------------------------------------------------- */

    if (
        !respiratoryCard ||
        !respiratorySection
    ) {

        console.log(
            "Respiratory card or section not found."
        );

        return;

    }


    /* =================================================
       OPEN RESPIRATORY
    ================================================= */

    respiratoryCard.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /* -----------------------------------------
               HIDE ALL OTHER BIOLEARN DETAIL PAGES
            ----------------------------------------- */

            document
                .querySelectorAll(
                    ".bio-topic-detail"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "bio-topic-active"
                    );

                });


            /* -----------------------------------------
               CLOSE OLD TOPIC SYSTEM
            ----------------------------------------- */

            document
                .querySelectorAll(
                    ".bio-topic-page"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "active"
                    );

                });


            /* -----------------------------------------
               OPEN RESPIRATORY
            ----------------------------------------- */

            respiratorySection.classList.add(
                "bio-topic-active"
            );


            /* -----------------------------------------
               DIRECT SCROLL TO RESPIRATORY
            ----------------------------------------- */

            setTimeout(function () {

                respiratorySection.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 50);

        }
    );

});


/* =====================================================
   CLOSE RESPIRATORY
===================================================== */

function closeRespiratoryTopic() {

    const respiratorySection =
        document.getElementById(
            "respiratoryTopic"
        );


    if (respiratorySection) {

        respiratorySection.classList.remove(
            "bio-topic-active"
        );

    }


    /* -----------------------------------------------
       RETURN TO BIOLEARN CARDS
    ------------------------------------------------ */

    const bioLearnSection =
        document.getElementById(
            "bioLearnSection"
        );


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}
/* ==========================================
   HUMAN BIOLOGY
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const card = document.querySelector(
        '.bio-learn-card[data-topic="human-biology"]'
    );

    const section = document.getElementById(
        "humanBiologyTopic"
    );

    console.log("Human Biology card:", card);
    console.log("Human Biology section:", section);


    if (!card) {
        console.log("❌ Human Biology CARD NOT FOUND");
        return;
    }

    if (!section) {
        console.log("❌ Human Biology SECTION NOT FOUND");
        return;
    }


    card.addEventListener("click", function (event) {

        event.preventDefault();

        console.log("✅ HUMAN BIOLOGY CARD CLICKED");


        /* Hide all topic pages */

        document.querySelectorAll(
            ".bio-topic-detail"
        ).forEach(function (item) {

            item.classList.remove(
                "bio-topic-active"
            );

        });


        /* Open Human Biology */

        section.classList.add(
            "bio-topic-active"
        );


        console.log(
            "✅ Human Biology section opened"
        );


        /* Scroll directly to it */

        setTimeout(function () {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    });

});


/* ==========================================
   CLOSE HUMAN BIOLOGY
========================================== */

function closeHumanBiologyTopic() {

    const section =
        document.getElementById(
            "humanBiologyTopic"
        );

    if (section) {

        section.classList.remove(
            "bio-topic-active"
        );

    }


    const bioLearn =
        document.getElementById(
            "bioLearnSection"
        );

    if (bioLearn) {

        bioLearn.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}
/* =====================================================
   BIOCHEMISTRY BIOLEARN
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const biochemistryCard =
        document.querySelector(
            '.bio-learn-card[data-topic="biochemistry"]'
        );

    const biochemistrySection =
        document.getElementById(
            "biochemistryTopic"
        );


    /* CHECK */

    if (
        !biochemistryCard ||
        !biochemistrySection
    ) {

        console.log(
            "Biochemistry card or section not found."
        );

        return;
    }


    /* =================================================
       OPEN BIOCHEMISTRY
    ================================================= */

    biochemistryCard.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();


            /* Hide all BioLearn topic pages */

            document
                .querySelectorAll(
                    ".bio-topic-detail"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "bio-topic-active"
                    );

                });


            /* Close old topic system */

            document
                .querySelectorAll(
                    ".bio-topic-page"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "active"
                    );

                });


            /* Open Biochemistry */

            biochemistrySection.classList.add(
                "bio-topic-active"
            );


            /* Direct scroll */

            setTimeout(function () {

                biochemistrySection.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 50);

        }
    );

});


/* =====================================================
   CLOSE BIOCHEMISTRY
===================================================== */

function closeBiochemistryTopic() {

    const biochemistrySection =
        document.getElementById(
            "biochemistryTopic"
        );


    if (biochemistrySection) {

        biochemistrySection.classList.remove(
            "bio-topic-active"
        );

    }


    /* Return to BioLearn */

    const bioLearnSection =
        document.getElementById(
            "bioLearnSection"
        );


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}
/* =====================================================
   GENETICS BIOLEARN
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const geneticsCard =
        document.querySelector(
            '.bio-learn-card[data-topic="genetics"]'
        );

    const geneticsSection =
        document.getElementById(
            "geneticsTopic"
        );


    if (!geneticsCard) {

        console.log(
            "❌ Genetics card not found"
        );

        return;

    }


    if (!geneticsSection) {

        console.log(
            "❌ Genetics section not found"
        );

        return;

    }


    /* =================================================
       OPEN GENETICS
    ================================================= */

    geneticsCard.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /* Hide all topic pages */

            document
                .querySelectorAll(
                    ".bio-topic-detail"
                )
                .forEach(function (section) {

                    section.classList.remove(
                        "bio-topic-active"
                    );

                });


            /* Open Genetics */

            geneticsSection.classList.add(
                "bio-topic-active"
            );


            /* Scroll directly to Genetics */

            setTimeout(function () {

                geneticsSection.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 50);

        }
    );

});


/* =====================================================
   CLOSE GENETICS
===================================================== */

function closeGeneticsTopic() {

    const geneticsSection =
        document.getElementById(
            "geneticsTopic"
        );


    if (geneticsSection) {

        geneticsSection.classList.remove(
            "bio-topic-active"
        );

    }


    const bioLearnSection =
        document.getElementById(
            "bioLearnSection"
        );


    if (bioLearnSection) {

        setTimeout(function () {

            bioLearnSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}
/* =========================================================
   BIOQUEST DATABASE — HEALTH PROFILE
   Safe integration without changing existing buttons
========================================================= */

async function saveHealthProfileToDatabase(profile) {

    if (!profile || !profile.name) {

        console.log(
            "No health profile available yet."
        );

        return;

    }


    // Get the currently logged-in user
    const userId =
        localStorage.getItem(
            "bioQuestUserId"
        );


    if (!userId) {

        console.warn(
            "No logged-in BioQuest user found."
        );

        alert(
            "Please login to your BioQuest profile before building your health profile."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `https://bioquest-5.onrender.com/api/users/${userId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name:
                            profile.name,

                        age:
                            Number(profile.age),

                        gender:
                            profile.sex,

                        height:
                            Number(profile.height),

                        weight:
                            Number(profile.weight)

                    })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Profile could not be saved"
            );

        }


        // Keep the updated user locally
        localStorage.setItem(
            "bioQuestUser",
            JSON.stringify(
                data.user
            )
        );


        console.log(
            "✅ BioQuest Health Profile updated:",
            data.user
        );


    } catch (error) {

        console.error(
            "❌ Could not save Health Profile:",
            error
        );

    }

}
/* =========================================================
   SAVE ANALYSIS REPORT TO MONGODB
========================================================= */

async function saveAnalysisToDatabase() {

    const userId = localStorage.getItem("bioQuestUserId");

    if (!userId) {
        console.warn("No BioQuest user ID found.");
        return;
    }

    if (
        !currentAnalysis ||
        !currentAnalysis.parameters ||
        currentAnalysis.parameters.length === 0
    ) {
        console.warn("No analysis results available.");
        return;
    }

    try {

        const results = currentAnalysis.parameters.map(function (item) {

            let status = "unknown";

            if (item.status === "normal") {
                status = "normal";
            } else if (item.status === "high") {
                status = "high";
            } else if (item.status === "low") {
                status = "low";
            } else if (item.status === "monitor") {
                status = "attention";
            }

            return {
                testName: item.name,
                value: String(item.value),
                unit: item.unit || "",
                status: status
            };

        });


        const response = await fetch(
            "https://bioquest-5.onrender.com/api/reports",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user: userId,

                    reportName:
                        "BioQuest Laboratory Report",

                    reportDate:
                        new Date().toISOString(),

                    results: results,

                    analysisSummary:
                        currentAnalysis.overallMessage || ""

                })
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Report could not be saved"
            );
        }


        console.log(
            "✅ Analysis report saved to MongoDB",
            data.report
        );


    } catch (error) {

        console.error(
            "❌ Report save error:",
            error
        );

    }
}
/* =========================================================
   BIOQUEST — LOAD SAVED REPORTS
========================================================= */

async function loadSavedReports() {

    const userId =
        localStorage.getItem("bioQuestUserId");

    if (!userId) {
        console.warn(
            "No BioQuest user ID found."
        );
        return;
    }

    try {

        const response = await fetch(
            `https://bioquest-5.onrender.com/api/reports/user/${userId}`
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Could not load reports"
            );

        }

        console.log(
            "✅ Saved reports loaded:",
            data.reports
        );

        return data.reports;

    } catch (error) {

        console.error(
            "❌ Could not load saved reports:",
            error
        );

        return [];

    }
}
/* =================================================
   PROFILE LOGIN / SIGNUP
================================================= */

const profileBtn =
    document.getElementById("profileBtn");

const profileModal =
    document.getElementById("profileModal");

const profileClose =
    document.getElementById("profileClose");

const authSubmit =
    document.getElementById("authSubmit");

const authSwitch =
    document.getElementById("authSwitch");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const authEmail =
    document.getElementById("authEmail");

const authPassword =
    document.getElementById("authPassword");

const authMessage =
    document.getElementById("authMessage");

const signupName =
    document.getElementById("signupName");

const signupOnly =
    document.querySelector(".signup-only");


let authMode = "login";


/* OPEN PROFILE */

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        function () {

            openBioQuestProfile();

        }
    );

}


/* CLOSE PROFILE */

if (profileClose) {

    profileClose.addEventListener("click", function () {

        profileModal.classList.remove("active");

    });

}


/* SWITCH LOGIN / SIGNUP */

if (authSwitch) {

    authSwitch.addEventListener("click", function () {

        authMessage.textContent = "";

        if (authMode === "login") {

            authMode = "signup";

            authTitle.textContent =
                "CREATE ACCOUNT";

            authSubtitle.textContent =
                "Create your BioQuest profile.";

            authSubmit.textContent =
                "SIGN UP";

            signupOnly.style.display =
                "block";

            authSwitch.innerHTML =
                `Already have an account?
                 <span>LOGIN</span>`;

        }

        else {

            authMode = "login";

            authTitle.textContent =
                "WELCOME BACK";

            authSubtitle.textContent =
                "Login to access your health profile.";

            authSubmit.textContent =
                "LOGIN";

            signupOnly.style.display =
                "none";

            authSwitch.innerHTML =
                `Don't have an account?
                 <span>CREATE ACCOUNT</span>`;

        }

    });

}


/* LOGIN / SIGNUP */

if (authSubmit) {

    authSubmit.addEventListener("click", async function () {

        const email =
            authEmail.value.trim();

        const password =
            authPassword.value;

        if (!email || !password) {

            authMessage.textContent =
                "Please enter email and password.";

            return;

        }


        try {

            let url;

            let body;


            if (authMode === "signup") {

                const name =
                    signupName.value.trim();

                if (!name) {

                    authMessage.textContent =
                        "Please enter your name.";

                    return;

                }

                url =
                    "https://bioquest-5.onrender.com/api/auth/signup";

                body = {

                    name: name,

                    email: email,

                    password: password

                };

            }

            else {

                url =
                    "https://bioquest-5.onrender.com/api/auth/login";

                body = {

                    email: email,

                    password: password

                };

            }


            const response =
                await fetch(url, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(body)

                });


            const data =
                await response.json();


            if (!response.ok ||
                !data.success) {

                authMessage.textContent =
                    data.message ||
                    "Something went wrong.";

                return;

            }


            /* SAVE USER ID */

            localStorage.setItem(
                "bioQuestUserId",
                data.user.id
            );


            localStorage.setItem(
                "bioQuestUser",
                JSON.stringify(
                    data.user
                )
            );


            authMessage.textContent =
                authMode === "login"
                    ? "Login successful."
                    : "Account created successfully.";


            setTimeout(function () {

                profileModal.classList.remove(
                    "active"
                );

            }, 700);


        }

        catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            authMessage.textContent =
                "Unable to connect to BioQuest server.";

        }
function bioQuestLogout() {

    localStorage.removeItem("bioQuestUserId");
    localStorage.removeItem("bioQuestUser");

    alert("You have been logged out.");

    location.reload();
}
    });

}
/* =================================================
   LOGGED-IN PROFILE DASHBOARD
================================================= */

const profileDashboard =
    document.getElementById("profileDashboard");

const profileDashboardClose =
    document.getElementById(
        "profileDashboardClose"
    );

const profileUserName =
    document.getElementById(
        "profileUserName"
    );

const profileUserEmail =
    document.getElementById(
        "profileUserEmail"
    );

const profileAge =
    document.getElementById(
        "profileAgeDisplay"
    );

const profileGender =
    document.getElementById(
        "profileGender"
    );

const profileHeight =
    document.getElementById(
        "profileHeightDisplay"
    );

const profileWeight =
    document.getElementById(
        "profileWeightDisplay"
    );

const profileReports =
    document.getElementById(
        "profileReports"
    );

const profileLogout =
    document.getElementById(
        "profileLogout"
    );


/* =================================================
   LOAD PROFILE
================================================= */

async function openBioQuestProfile() {

    const userId =
        localStorage.getItem(
            "bioQuestUserId"
        );

    const savedUser =
        localStorage.getItem(
            "bioQuestUser"
        );


    if (!userId || !savedUser) {

        profileModal.classList.add(
            "active"
        );

        return;

    }


    try {

        const user =
            JSON.parse(savedUser);


        profileUserName.textContent =
            user.name ||
            "YOUR PROFILE";


        profileUserEmail.textContent =
            user.email ||
            "";


        profileAge.textContent =
            user.age ||
            "—";


        profileGender.textContent =
            user.gender ||
            "—";


        profileHeight.textContent =
            user.height
                ? `${user.height} cm`
                : "—";


        profileWeight.textContent =
            user.weight
                ? `${user.weight} kg`
                : "—";


        profileDashboard.classList.add(
            "active"
        );


         loadProfileReports(
            userId
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


async function loadProfileReports(userId) {

    profileReports.innerHTML = `
        <p class="profile-empty">
            Loading reports...
        </p>
    `;

    try {

        const response = await fetch(
            `https://bioquest-5.onrender.com/api/reports/user/${userId}`
        );

        const data = await response.json();

        console.log(
            "📄 Reports received:",
            JSON.stringify(data, null, 2)
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load reports"
            );

        }


        if (
            !data.reports ||
            data.reports.length === 0
        ) {

            profileReports.innerHTML = `
                <p class="profile-empty">
                    No saved reports yet.
                </p>
            `;

            return;

        }


        profileReports.innerHTML = "";


        data.reports.forEach(function (report) {

            const item =
                document.createElement("div");

            item.className =
                "profile-report";


            const date =
                report.reportDate
                    ? new Date(
                        report.reportDate
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "Unknown date";


            const resultCount =
                report.results
                    ? report.results.length
                    : 0;


            let resultsHTML = "";


            if (
                report.results &&
                report.results.length > 0
            ) {

                resultsHTML =
                    report.results.map(
                        function (result) {

                            return `

                                <div class="saved-result">

                                    <span>
                                        ${result.testName}
                                    </span>

                                    <strong>
                                        ${result.value}
                                        ${result.unit || ""}
                                    </strong>

                                </div>

                            `;

                        }
                    ).join("");

            }


            item.innerHTML = `

                <div class="profile-report-header">

                    <div>

                        <div class="profile-report-title">

                            ${report.reportName ||
                              "Laboratory Report"}

                        </div>

                        <div class="profile-report-date">

                            ${date}
                            ·
                            ${resultCount}
                            parameter${resultCount === 1 ? "" : "s"}

                        </div>

                    </div>

                    <span class="report-arrow">
                        ↓
                    </span>

                </div>

<button
    class="delete-report-btn"
    data-report-id="${report._id}">
    DELETE REPORT
</button>
                <div class="saved-report-details">

                    <div class="saved-report-summary">

                        ${
                            report.analysisSummary ||
                            "No analysis summary available."
                        }

                    </div>


                    <div class="saved-results">

                        ${resultsHTML}

                    </div>

                </div>

            `;


            const header =
                item.querySelector(
                    ".profile-report-header"
                );


            const details =
                item.querySelector(
                    ".saved-report-details"
                );


            if (header && details) {

                header.addEventListener(
                    "click",
                    function () {

                        details.classList.toggle(
                            "open"
                        );

                        item.classList.toggle(
                            "expanded"
                        );

                    }
                );

            }


            profileReports.appendChild(item);
            const deleteBtn =
    item.querySelector(".delete-report-btn");

if (deleteBtn) {

    deleteBtn.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();

            const confirmed =
                confirm(
                    "Delete this saved report?"
                );

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `https://bioquest-5.onrender.com/api/reports/${report._id}`,
                        {
                            method: "DELETE"
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.message ||
                        "Could not delete report"
                    );

                }

                // Reload the reports
                await loadProfileReports(userId);

            } catch (error) {

                console.error(
                    "❌ Delete report error:",
                    error
                );

                alert(
                    "Unable to delete report."
                );

            }

        }
    );

}

        });


    } catch (error) {

        console.error(
            "❌ Report loading error:",
            error
        );


        profileReports.innerHTML = `
            <p class="profile-empty">
                Unable to load saved reports.
            </p>
        `;

    }

}


/* =================================================
   PROFILE BUTTON
================================================= */

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        function () {

            openBioQuestProfile();

        }
    );

}


/* =================================================
   CLOSE PROFILE
================================================= */

if (profileDashboardClose) {

    profileDashboardClose.addEventListener(
        "click",
        function () {

            profileDashboard.classList.remove(
                "active"
            );

        }
    );

}


/* =================================================
   LOGOUT
================================================= */

if (profileLogout) {

    profileLogout.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "bioQuestUserId"
            );

            localStorage.removeItem(
                "bioQuestUser"
            );


            profileDashboard.classList.remove(
                "active"
            );


            profileModal.classList.add(
                "active"
            );

        }
    );

}