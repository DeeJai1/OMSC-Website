const SESSION_ENDPOINT =
    "/api/stream-credits";

const CONFIGURATION_ENDPOINT =
    "/api/configuration/";

const ASSET_STATE_ENDPOINT =
    "/api/widget/credits/state";

const POLL_INTERVAL_MS =
    2000;

const previewParameters =
    new URLSearchParams(
        window.location.search);

const previewMode =
    previewParameters.get(
        "preview") ===
    "1";

const populatedPreviewMode =
    previewMode &&
    previewParameters.get(
        "sample") ===
    "1";

let creditsModuleEnabled =
    previewMode;

const DEFAULT_SCROLL_SPEED_PX_PER_SECOND =
    45;

const MIN_SCROLL_SPEED_PX_PER_SECOND =
    20;

const MAX_SCROLL_SPEED_PX_PER_SECOND =
    90;

const DEFAULT_CANVAS_WIDTH =
    1920;

const DEFAULT_CANVAS_HEIGHT =
    1080;


let canvasWidthPixels =
    DEFAULT_CANVAS_WIDTH;

let canvasHeightPixels =
    DEFAULT_CANVAS_HEIGHT;

let canvasScale =
    1;

let contentScale =
    1;


let scrollSpeedPixelsPerSecond =
    DEFAULT_SCROLL_SPEED_PX_PER_SECOND;

let maximumCycles =
    0;

let completedCycles =
    0;

let rollLimitReached =
    false;

let currentRenderSignature =
    "";

let rollAnimationFrame =
    null;

let rollPositionY =
    0;

let rollLastTimestamp =
    null;


const SUPPORTED_CREDITS_LAYOUTS =
    [
        "ClassicRoll",
        "PerspectiveCrawl",
        "FlyingCredits",
        "CreditCards",
        "Spotlight",
        "RetroArcade",
        "Terminal"
    ];

const SUPPORTED_FLYING_STYLES =
    [
        "Mixed",
        "Slide",
        "Swing",
        "Drop",
        "Pop"
    ];

const SUPPORTED_RETRO_PALETTES =
    [
        "NeonArcade",
        "GreenCrt",
        "AmberTerminal",
        "Synth80s",
        "Monochrome"
    ];

const RETRO_PALETTE_DEFINITIONS =
    {
        NeonArcade: {
            panelRgb:
                "22, 8, 46",

            cardRgb:
                "13, 4, 31",

            borderColour:
                "#00D9FF",

            cardBorderColour:
                "rgba(0, 217, 255, 0.52)",

            scanlineColour:
                "rgba(0, 217, 255, 0.11)",

            shadowColour:
                "rgba(255, 59, 203, 0.46)",

            glowColour:
                "rgba(0, 217, 255, 0.34)",

            overlayStart:
                "rgba(255, 59, 203, 0.17)",

            overlayEnd:
                "rgba(0, 217, 255, 0.08)"
        },

        GreenCrt: {
            panelRgb:
                "2, 24, 11",

            cardRgb:
                "1, 16, 7",

            borderColour:
                "#66FF99",

            cardBorderColour:
                "rgba(102, 255, 153, 0.50)",

            scanlineColour:
                "rgba(102, 255, 153, 0.10)",

            shadowColour:
                "rgba(30, 255, 115, 0.34)",

            glowColour:
                "rgba(102, 255, 153, 0.28)",

            overlayStart:
                "rgba(102, 255, 153, 0.10)",

            overlayEnd:
                "rgba(0, 90, 35, 0.06)"
        },

        AmberTerminal: {
            panelRgb:
                "38, 20, 2",

            cardRgb:
                "25, 12, 0",

            borderColour:
                "#FFB000",

            cardBorderColour:
                "rgba(255, 176, 0, 0.52)",

            scanlineColour:
                "rgba(255, 176, 0, 0.10)",

            shadowColour:
                "rgba(255, 120, 0, 0.38)",

            glowColour:
                "rgba(255, 176, 0, 0.28)",

            overlayStart:
                "rgba(255, 176, 0, 0.12)",

            overlayEnd:
                "rgba(120, 50, 0, 0.06)"
        },

        Synth80s: {
            panelRgb:
                "21, 8, 58",

            cardRgb:
                "13, 5, 38",

            borderColour:
                "#5DEBFF",

            cardBorderColour:
                "rgba(255, 79, 216, 0.50)",

            scanlineColour:
                "rgba(93, 235, 255, 0.10)",

            shadowColour:
                "rgba(255, 79, 216, 0.46)",

            glowColour:
                "rgba(138, 92, 255, 0.38)",

            overlayStart:
                "rgba(138, 92, 255, 0.18)",

            overlayEnd:
                "rgba(255, 79, 216, 0.10)"
        },

        Monochrome: {
            panelRgb:
                "15, 17, 20",

            cardRgb:
                "9, 10, 12",

            borderColour:
                "#B8C0CC",

            cardBorderColour:
                "rgba(184, 192, 204, 0.44)",

            scanlineColour:
                "rgba(220, 225, 232, 0.08)",

            shadowColour:
                "rgba(0, 0, 0, 0.55)",

            glowColour:
                "rgba(184, 192, 204, 0.15)",

            overlayStart:
                "rgba(255, 255, 255, 0.035)",

            overlayEnd:
                "rgba(100, 110, 125, 0.025)"
        }
    };


const TERMINAL_THEME_DEFINITIONS =
    {
        GreenCrt: {
            background:
                "rgba(1, 19, 7, 0.92)",

            panel:
                "rgba(0, 11, 4, 0.95)",

            text:
                "#72FF91",

            prompt:
                "#B5FFC3",

            heading:
                "#39FF68",

            muted:
                "#4DBB65",

            border:
                "rgba(73, 255, 111, 0.58)",

            glow:
                "rgba(57, 255, 104, 0.24)",

            scanline:
                "rgba(93, 255, 126, 0.055)"
        },

        Amber: {
            background:
                "rgba(28, 14, 0, 0.93)",

            panel:
                "rgba(17, 8, 0, 0.95)",

            text:
                "#FFC75A",

            prompt:
                "#FFE2A1",

            heading:
                "#FFAE22",

            muted:
                "#C78322",

            border:
                "rgba(255, 174, 34, 0.60)",

            glow:
                "rgba(255, 174, 34, 0.24)",

            scanline:
                "rgba(255, 190, 76, 0.055)"
        },

        DosBlue: {
            background:
                "rgba(0, 0, 133, 0.94)",

            panel:
                "rgba(0, 0, 103, 0.96)",

            text:
                "#FFFFFF",

            prompt:
                "#55FFFF",

            heading:
                "#FFFF55",

            muted:
                "#AAAAAA",

            border:
                "rgba(85, 255, 255, 0.72)",

            glow:
                "rgba(85, 255, 255, 0.18)",

            scanline:
                "rgba(255, 255, 255, 0.04)"
        },

        ModernConsole: {
            background:
                "rgba(8, 11, 16, 0.94)",

            panel:
                "rgba(5, 7, 11, 0.96)",

            text:
                "#D8DEE9",

            prompt:
                "#7EE787",

            heading:
                "#58A6FF",

            muted:
                "#8B949E",

            border:
                "rgba(88, 166, 255, 0.48)",

            glow:
                "rgba(88, 166, 255, 0.16)",

            scanline:
                "rgba(255, 255, 255, 0.025)"
        }
    };


let creditsLayout =
    "ClassicRoll";

let sectionDisplaySeconds =
    6;

let transitionDurationMilliseconds =
    700;

let flyingAnimationStyle =
    "Mixed";

let perspectiveStrengthPercent =
    65;

let retroPalette =
    "NeonArcade";

let retroPanelOpacityPercent =
    72;

let terminalTheme =
    "GreenCrt";

let terminalBackgroundOpacityPercent =
    92;

let terminalTypingMilliseconds =
    35;

let terminalTimer =
    null;

let terminalRunToken =
    0;

let sequenceTimer =
    null;

let sequenceTransitionTimer =
    null;

let sequenceIndex =
    0;

const canvas =
    document.getElementById(
        "credits-canvas");

const scaleShell =
    document.getElementById(
        "credits-scale-shell");

const content =
    document.getElementById(
        "credits-content");


const sectionDefinitions =
    [
        {
            type: "chatter",
            key: "chatters",
            showProfileImage: true,
            compactWhenProfileHidden: true
        },
        {
            type: "firstTimeChatter",
            key: "firstTimeChatters",
            showProfileImage: true,
            compactWhenProfileHidden: true
        },
        {
            type: "moderator",
            key: "moderators",
            showProfileImage: true,
            compactWhenProfileHidden: true
        },
        {
            type: "bits",
            key: "bits",
            showProfileImage: true
        },
        {
            type: "follow",
            key: "follows",
            showProfileImage: true
        },
        {
            type: "subscription",
            key: "subscribers",
            showProfileImage: true
        },
        {
            type: "resubscription",
            key: "resubscribers",
            showProfileImage: true
        },
        {
            type: "giftedSubscription",
            key: "giftedSubscriptions",
            showProfileImage: true
        },
        {
            type: "raid",
            key: "raids",
            showProfileImage: true
        },
        {
            type: "watchStreak",
            key: "watchStreaks",
            showProfileImage: true
        }
    ];

const defaultSectionOrder =
    sectionDefinitions.map(
        definition =>
            definition.key);


const defaultTitles =
    {
        chatters:
            "Chatters",

        firstTimeChatters:
            "First-Time Chatters",

        moderators:
            "Moderators",

        bits:
            "Bits",

        follows:
            "Followers",

        subscribers:
            "Subscribers",

        resubscribers:
            "Resubscribers",

        giftedSubscriptions:
            "Gifted Subs",

        raids:
            "Raiders",

        watchStreaks:
            "Watch Streaks"
    };


function createPreviewAvatar(
    initials)
{
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
        `<rect width="96" height="96" rx="48" fill="#241A36"/>` +
        `<circle cx="48" cy="48" r="43" fill="none" stroke="#76FF21" stroke-width="4"/>` +
        `<text x="48" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#FFFFFF">${initials}</text>` +
        `</svg>`;

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
            svg)
    );
}


function createPreviewEntries()
{
    return [
        // ----------------------------------------------------
        // Chatters - 6
        // ----------------------------------------------------

        {
            type: "chatter",
            userName: "captain_caffeinated",
            displayName: "CaptainCaffeinated",
            profileImageUrl:
                createPreviewAvatar("CC")
        },

        {
            type: "chatter",
            userName: "pixelpirate",
            displayName: "PixelPirate",
            profileImageUrl:
                createPreviewAvatar("PP")
        },

        {
            type: "chatter",
            userName: "old_school_gamer",
            displayName: "OldSchoolGamer",
            profileImageUrl:
                createPreviewAvatar("OG")
        },

        {
            type: "chatter",
            userName: "chaotic_penguin",
            displayName: "ChaoticPenguin",
            profileImageUrl:
                createPreviewAvatar("CP")
        },

        {
            type: "chatter",
            userName: "steve",
            displayName: "Steve",
            profileImageUrl:
                createPreviewAvatar("ST")
        },

        {
            type: "chatter",
            userName: "definitely_not_a_bot",
            displayName: "DefinitelyNotABot",
            profileImageUrl:
                createPreviewAvatar("DB")
        },


        // ----------------------------------------------------
        // First-Time Chatters - 4
        // ----------------------------------------------------

        {
            type: "firstTimeChatter",
            userName: "newkidontheblock",
            displayName: "NewKidOnTheBlock",
            profileImageUrl:
                createPreviewAvatar("NK")
        },

        {
            type: "firstTimeChatter",
            userName: "lost_and_confused",
            displayName: "LostAndConfused",
            profileImageUrl:
                createPreviewAvatar("LC")
        },

        {
            type: "firstTimeChatter",
            userName: "hello_there_82",
            displayName: "HelloThere82",
            profileImageUrl:
                createPreviewAvatar("HT")
        },

        {
            type: "firstTimeChatter",
            userName: "lurker_no_more",
            displayName: "LurkerNoMore",
            profileImageUrl:
                createPreviewAvatar("LN")
        },


        // ----------------------------------------------------
        // Moderators - 3
        // ----------------------------------------------------

        {
            type: "moderator",
            userName: "modfather",
            displayName: "TheModFather",
            profileImageUrl:
                createPreviewAvatar("TM")
        },

        {
            type: "moderator",
            userName: "ban_hammer_betty",
            displayName: "BanHammerBetty",
            profileImageUrl:
                createPreviewAvatar("BB")
        },

        {
            type: "moderator",
            userName: "keeper_of_the_peace",
            displayName: "KeeperOfThePeace",
            profileImageUrl:
                createPreviewAvatar("KP")
        },


        // ----------------------------------------------------
        // Bits - 4
        // ----------------------------------------------------

        {
            type: "bits",
            userName: "bit_bandit",
            displayName: "BitBandit",
            amount: 100,
            detail: "",
            profileImageUrl:
                createPreviewAvatar("BB")
        },

        {
            type: "bits",
            userName: "therabbits260",
            displayName: "TheRabbits260",
            amount: 600,
            detail: "🐶 Myla - Give Treat to Myla",
            powerUps: [
                {
                    name: "Wear the HELMET!!!",
                    amount: 500,
                    count: 1
                },
                {
                    name: "🐶 Myla - Give Treat to Myla",
                    amount: 100,
                    count: 1
                }
            ],
            profileImageUrl:
                createPreviewAvatar("TR")
        },

        {
            type: "bits",
            userName: "coffee_fuelled",
            displayName: "CoffeeFuelled",
            amount: 1500,
            detail: "Custom Power-up",
            profileImageUrl:
                createPreviewAvatar("CF")
        },

        {
            type: "bits",
            userName: "wallet_warrior",
            displayName: "WalletWarrior",
            amount: 10000,
            detail: "Absolute chaos",
            profileImageUrl:
                createPreviewAvatar("WW")
        },


        // ----------------------------------------------------
        // Followers - 5
        // ----------------------------------------------------

        {
            type: "follow",
            userName: "fresh_follow",
            displayName: "FreshFollow",
            profileImageUrl:
                createPreviewAvatar("FF")
        },

        {
            type: "follow",
            userName: "late_to_the_party",
            displayName: "LateToTheParty",
            profileImageUrl:
                createPreviewAvatar("LP")
        },

        {
            type: "follow",
            userName: "gaming_gran",
            displayName: "GamingGran",
            profileImageUrl:
                createPreviewAvatar("GG")
        },

        {
            type: "follow",
            userName: "keyboard_commando",
            displayName: "KeyboardCommando",
            profileImageUrl:
                createPreviewAvatar("KC")
        },

        {
            type: "follow",
            userName: "one_more_game",
            displayName: "OneMoreGame",
            profileImageUrl:
                createPreviewAvatar("OG")
        },


        // ----------------------------------------------------
        // Subscribers - 4
        // ----------------------------------------------------

        {
            type: "subscription",
            userName: "tier_one_tim",
            displayName: "TierOneTim",
            subscriptionTier: "Tier 1",
            profileImageUrl:
                createPreviewAvatar("TT")
        },

        {
            type: "subscription",
            userName: "supportive_sally",
            displayName: "SupportiveSally",
            subscriptionTier: "Tier 1",
            profileImageUrl:
                createPreviewAvatar("SS")
        },

        {
            type: "subscription",
            userName: "double_down_dave",
            displayName: "DoubleDownDave",
            subscriptionTier: "Tier 2",
            profileImageUrl:
                createPreviewAvatar("DD")
        },

        {
            type: "subscription",
            userName: "big_spender_bob",
            displayName: "BigSpenderBob",
            subscriptionTier: "Tier 3",
            profileImageUrl:
                createPreviewAvatar("BB")
        },


        // ----------------------------------------------------
        // Resubscribers - 4
        // ----------------------------------------------------

        {
            type: "resubscription",
            userName: "returning_fan",
            displayName: "ReturningFan",
            subscriptionMonths: 3,
            subscriptionStreak: 3,
            profileImageUrl:
                createPreviewAvatar("RF")
        },

        {
            type: "resubscription",
            userName: "still_here_somehow",
            displayName: "StillHereSomehow",
            subscriptionMonths: 12,
            subscriptionStreak: 8,
            profileImageUrl:
                createPreviewAvatar("SH")
        },

        {
            type: "resubscription",
            userName: "absolute_legend",
            displayName: "AbsoluteLegend",
            subscriptionMonths: 24,
            subscriptionStreak: 17,
            profileImageUrl:
                createPreviewAvatar("AL")
        },

        {
            type: "resubscription",
            userName: "ancient_subscriber",
            displayName: "AncientSubscriber",
            subscriptionMonths: 48,
            subscriptionStreak: 36,
            profileImageUrl:
                createPreviewAvatar("AS")
        },


        // ----------------------------------------------------
        // Gifted Subscriptions - 4
        // ----------------------------------------------------

        {
            type: "giftedSubscription",
            userName: "gift_giver",
            displayName: "GiftGiver",
            count: 1,
            profileImageUrl:
                createPreviewAvatar("GG")
        },

        {
            type: "giftedSubscription",
            userName: "generous_george",
            displayName: "GenerousGeorge",
            count: 5,
            profileImageUrl:
                createPreviewAvatar("GG")
        },

        {
            type: "giftedSubscription",
            userName: "community_hero",
            displayName: "CommunityHero",
            count: 10,
            profileImageUrl:
                createPreviewAvatar("CH")
        },

        {
            type: "giftedSubscription",
            userName: "completely_unhinged",
            displayName: "CompletelyUnhinged",
            count: 25,
            profileImageUrl:
                createPreviewAvatar("CU")
        },


        // ----------------------------------------------------
        // Raiders - 3
        // ----------------------------------------------------

        {
            type: "raid",
            userName: "tiny_raid",
            displayName: "TinyRaid",
            viewerCount: 7,
            profileImageUrl:
                createPreviewAvatar("TR")
        },

        {
            type: "raid",
            userName: "raid_captain",
            displayName: "RaidCaptain",
            viewerCount: 42,
            profileImageUrl:
                createPreviewAvatar("RC")
        },

        {
            type: "raid",
            userName: "incoming_horde",
            displayName: "IncomingHorde",
            viewerCount: 237,
            profileImageUrl:
                createPreviewAvatar("IH")
        },


        // ----------------------------------------------------
        // Watch Streaks - 3
        // ----------------------------------------------------

        {
            type: "watchStreak",
            userName: "regular_customer",
            displayName: "RegularCustomer",
            watchStreak: 3,
            profileImageUrl:
                createPreviewAvatar("RC")
        },

        {
            type: "watchStreak",
            userName: "never_misses_stream",
            displayName: "NeverMissesAStream",
            watchStreak: 12,
            profileImageUrl:
                createPreviewAvatar("NM")
        },

        {
            type: "watchStreak",
            userName: "professional_lurker",
            displayName: "ProfessionalLurker",
            watchStreak: 37,
            profileImageUrl:
                createPreviewAvatar("PL")
        }
    ];
}

function normaliseIgnoredUser(
    value)
{
    return (
        value
        ?? ""
    )
        .toString()
        .trim()
        .replace(
            /^@+/,
            "")
        .toLowerCase();
}


function getIgnoredUsers(
    configuration)
{
    const configuredUsers =
        configuration?.settings
            ?.streamCredits
            ?.ignoredUsers;

    if (!Array.isArray(
            configuredUsers))
    {
        return new Set();
    }

    return new Set(
        configuredUsers
            .map(
                normaliseIgnoredUser)
            .filter(
                Boolean));
}


function isIgnoredCreditEntry(
    entry,
    ignoredUsers)
{
    if (!ignoredUsers ||
        ignoredUsers.size === 0)
    {
        return false;
    }

    const userName =
        normaliseIgnoredUser(
            entry?.userName);

    const displayName =
        normaliseIgnoredUser(
            entry?.displayName);

    return (
        (
            userName &&
            ignoredUsers.has(
                userName)
        ) ||
        (
            displayName &&
            ignoredUsers.has(
                displayName)
        )
    );
}


function getDisplayEntries(
    session,
    configuration)
{
    const realEntries =
        Array.isArray(
            session?.entries)
            ? session.entries
            : [];

    const sourceEntries =
        populatedPreviewMode
            ? createPreviewEntries()
            : (
                (
                    realEntries.length > 0 ||
                    !previewMode
                )
                    ? realEntries
                    : createPreviewEntries()
            );

    const ignoredUsers =
        getIgnoredUsers(
            configuration);

    if (ignoredUsers.size === 0)
    {
        return sourceEntries;
    }

    return sourceEntries.filter(
        entry =>
            !isIgnoredCreditEntry(
                entry,
                ignoredUsers));
}


function getOrderedSectionDefinitions(
    sectionOrder)
{
    const definitionsByKey =
        new Map(
            sectionDefinitions.map(
                definition =>
                    [
                        definition.key,
                        definition
                    ]));

    const order =
        Array.isArray(
            sectionOrder)
            ? sectionOrder
            : [];

    const valid =
        order.length ===
            sectionDefinitions.length &&
        new Set(
            order).size ===
            sectionDefinitions.length &&
        order.every(
            key =>
                definitionsByKey.has(
                    key));

    const effectiveOrder =
        valid
            ? order
            : defaultSectionOrder;

    return effectiveOrder.map(
        key =>
            definitionsByKey.get(
                key));
}


function getDisplayName(
    entry)
{
    return (
        entry?.displayName ||
        entry?.userName ||
        ""
    ).trim();
}


function getHeadingTextShadow(
    colour,
    glowPercent)
{
    const baseShadow =
        "0 2px 6px rgba(0, 0, 0, 0.55)";

    const match =
        /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/
            .exec(
                colour);

    const strength =
        Math.min(
            100,
            Math.max(
                0,
                Number(glowPercent) || 0)) /
        100;

    if (!match ||
        strength <= 0)
    {
        return baseShadow;
    }

    const red =
        Number.parseInt(
            match[1],
            16);

    const green =
        Number.parseInt(
            match[2],
            16);

    const blue =
        Number.parseInt(
            match[3],
            16);

    const innerBlur =
        5 +
        (7 * strength);

    const outerBlur =
        12 +
        (20 * strength);

    const innerAlpha =
        (0.70 * strength)
            .toFixed(
                3);

    const outerAlpha =
        (0.42 * strength)
            .toFixed(
                3);

    return [
        baseShadow,

        `0 0 ${innerBlur}px rgba(${red}, ${green}, ${blue}, ${innerAlpha})`,

        `0 0 ${outerBlur}px rgba(${red}, ${green}, ${blue}, ${outerAlpha})`
    ].join(
        ", ");
}


function createLogo(
    assetState)
{
    const logoImageUrl =
        (
            assetState?.logoImageUrl
            ?? ""
        ).trim();

    if (!logoImageUrl)
    {
        return null;
    }

    const container =
        document.createElement(
            "div");

    container.className =
        "credits-logo";

    const image =
        document.createElement(
            "img");

    image.className =
        "credits-logo-image";

    image.alt =
        "";

    image.onload =
        () =>
        {
            if (!rollLimitReached)
            {
                restartCreditsRoll();
            }
        };

    image.src =
        logoImageUrl;

    container.appendChild(
        image);

    return container;
}

function getEntryDetail(
    entry)
{
    switch (entry?.type)
    {
        case "bits":
        {
            const amount =
                Math.max(
                    0,
                    Number(entry.amount) || 0);

            return `${amount.toLocaleString()} Bits`;
        }

        case "follow":
            return "New follower";

        case "subscription":
        {
            const tier =
                (
                    entry.subscriptionTier
                    ?? ""
                ).trim();

            return tier
                ? `${tier} subscriber`
                : "Subscriber";
        }

        case "resubscription":
        {
            const months =
                Math.max(
                    0,
                    Number(entry.subscriptionMonths) || 0);

            const streak =
                Math.max(
                    0,
                    Number(entry.subscriptionStreak) || 0);

            const parts =
                [];

            if (months > 0)
            {
                parts.push(
                    `${months} month${months === 1 ? "" : "s"}`);
            }

            if (streak > 0)
            {
                parts.push(
                    `${streak} month streak`);
            }

            return parts.join(
                " • ");
        }

        case "giftedSubscription":
        {
            const count =
                Math.max(
                    1,
                    Number(entry.count) || 1);

            return `${count} gifted sub${count === 1 ? "" : "s"}`;
        }

        case "raid":
        {
            const viewers =
                Math.max(
                    0,
                    Number(entry.viewerCount) || 0);

            return viewers > 0
                ? `${viewers.toLocaleString()} viewer raid`
                : "Raid";
        }

        case "watchStreak":
        {
            const streak =
                Math.max(
                    0,
                    Number(entry.watchStreak) || 0);

            return streak > 0
                ? `${streak} stream watch streak`
                : "Watch streak";
        }

        default:
            return "";
    }
}


function getPowerUpBreakdown(
    entry)
{
    if (entry?.type !==
        "bits")
    {
        return [];
    }

    const powerUps =
        Array.isArray(
            entry.powerUps)
            ? entry.powerUps
                .filter(
                    powerUp =>
                        powerUp &&
                        (
                            powerUp.name
                            ?? ""
                        ).trim())
                .map(
                    powerUp =>
                        ({
                            name:
                                (
                                    powerUp.name
                                    ?? ""
                                ).trim(),

                            amount:
                                Math.max(
                                    0,
                                    Number(
                                        powerUp.amount) ||
                                    0),

                            count:
                                Math.max(
                                    1,
                                    Number(
                                        powerUp.count) ||
                                    1)
                        }))
            : [];

    if (powerUps.length > 0)
    {
        return powerUps;
    }

    /*
        Backward compatibility with older Stream Credits data.

        If there was exactly one Bits event and Detail contains
        a Power-up name, the full amount safely belongs to that
        one Power-up.

        If there were multiple Bits events, do not guess how the
        historical total was divided.
    */

    const legacyName =
        (
            entry.detail
            ?? ""
        ).trim();

    const eventCount =
        Math.max(
            1,
            Number(
                entry.count) ||
            1);

    if (!legacyName ||
        eventCount !== 1)
    {
        return [];
    }

    return [
        {
            name:
                legacyName,

            amount:
                Math.max(
                    0,
                    Number(
                        entry.amount) ||
                    0),

            count:
                1
        }
    ];
}


function getInitials(
    value)
{
    const words =
        (
            value
            ?? ""
        )
            .trim()
            .split(
                /\s+/)
            .filter(
                Boolean);

    if (words.length === 0)
    {
        return "?";
    }

    if (words.length === 1)
    {
        return words[0]
            .slice(
                0,
                2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


function getTerminalCreditDetail(
    entry)
{
    switch (entry?.type)
    {
        case "bits":
        {
            const amount =
                Math.max(
                    0,
                    Number(
                        entry.amount) || 0);

            const total =
                `${amount.toLocaleString()} Bits`;

            const powerUps =
                getPowerUpBreakdown(
                    entry);

            if (powerUps.length === 0)
            {
                return total;
            }

            const breakdown =
                powerUps
                    .map(
                        powerUp =>
                        {
                            const powerAmount =
                                powerUp.amount > 0
                                    ? ` ${powerUp.amount.toLocaleString()} Bits`
                                    : "";

                            const count =
                                powerUp.count > 1
                                    ? ` x${powerUp.count}`
                                    : "";

                            return `${powerUp.name}${powerAmount}${count}`;
                        })
                    .join(
                        "; ");

            return `${total} | ${breakdown}`;
        }
        case "giftedSubscription":
        {
            const count =
                Math.max(
                    1,
                    Number(
                        entry.count) || 1);

            return `${count} gifted sub${count === 1 ? "" : "s"}`;
        }

        case "raid":
        {
            const viewers =
                Math.max(
                    0,
                    Number(
                        entry.viewerCount) || 0);

            return viewers > 0
                ? `${viewers.toLocaleString()} viewer raid`
                : "Raid";
        }

        case "watchStreak":
        {
            const streak =
                Math.max(
                    0,
                    Number(
                        entry.watchStreak) || 0);

            return streak > 0
                ? `${streak} stream watch streak`
                : "Watch streak";
        }

        default:
            return "";
    }
}


function createCreditEntryCard(
    definition,
    entry,
    nameColour,
    headingColour,
    showProfileImages)
{
    const name =
        getDisplayName(
            entry);

    if (!name)
    {
        return null;
    }

    const card =
        document.createElement(
            "div");

    card.className =
        "credits-entry-card";

    const terminalDetail =
        getTerminalCreditDetail(
            entry);

    if (terminalDetail)
    {
        card.dataset.terminalDetail =
            terminalDetail;
    }

    card.style.borderLeftColor =
        headingColour;


    const displayProfileImage =
        definition.showProfileImage &&
        showProfileImages;

    if (displayProfileImage)
    {
        card.classList.add(
            "credits-entry-card-with-avatar");

        const avatar =
            document.createElement(
                "div");

        avatar.className =
            "credits-entry-avatar";

        const fallback =
            document.createElement(
                "span");

        fallback.className =
            "credits-entry-avatar-fallback";

        fallback.textContent =
            getInitials(
                name);

        avatar.appendChild(
            fallback);

        const imageUrl =
            (
                entry?.profileImageUrl
                ?? ""
            ).trim();

        if (imageUrl)
        {
            const image =
                document.createElement(
                    "img");

            image.className =
                "credits-entry-avatar-image";

            image.alt =
                "";

            image.onload =
                () =>
                {
                    avatar.classList.add(
                        "has-image");
                };

            image.onerror =
                () =>
                {
                    image.remove();
                };

            image.src =
                imageUrl;

            avatar.appendChild(
                image);
        }

        card.appendChild(
            avatar);
    }
    else if (
        definition.compactWhenProfileHidden)
    {
        card.classList.add(
            "credits-entry-card-compact");
    }


    const body =
        document.createElement(
            "div");

    body.className =
        "credits-entry-body";

    const nameElement =
        document.createElement(
            "div");

    nameElement.className =
        "credits-entry-name";

    nameElement.style.color =
        nameColour;

    nameElement.textContent =
        name;

    body.appendChild(
        nameElement);


    const detail =
        getEntryDetail(
            entry);

    if (detail)
    {
        const detailElement =
            document.createElement(
                "div");

        detailElement.className =
            "credits-entry-detail";

        detailElement.textContent =
            detail;

        body.appendChild(
            detailElement);
    }


    const powerUps =
        getPowerUpBreakdown(
            entry);

    if (powerUps.length > 0)
    {
        const powerUpList =
            document.createElement(
                "div");

        powerUpList.className =
            "credits-power-up-list";

        for (const powerUp of powerUps)
        {
            const item =
                document.createElement(
                    "div");

            item.className =
                "credits-power-up-item";

            const amountText =
                powerUp.amount > 0
                    ? ` — ${powerUp.amount.toLocaleString()} Bits`
                    : "";

            const countText =
                powerUp.count > 1
                    ? ` (${powerUp.count}×)`
                    : "";

            item.textContent =
                `${powerUp.name}${amountText}${countText}`;

            powerUpList.appendChild(
                item);
        }

        body.appendChild(
            powerUpList);
    }


    card.appendChild(
        body);

    return card;
}


function createSection(
    definition,
    entries,
    titles,
    headingColour,
    nameColour,
    headingGlowPercent,
    profileImageVisibility,
    columnCount)
{
    const matchingEntries =
        entries.filter(
            entry =>
                entry?.type ===
                definition.type);

    if (matchingEntries.length === 0)
    {
        return null;
    }

    const section =
        document.createElement(
            "section");

    section.className =
        "credits-section";

    const heading =
        document.createElement(
            "div");

    heading.className =
        "credits-heading";

    heading.style.color =
        headingColour;

    heading.style.textShadow =
        getHeadingTextShadow(
            headingColour,
            headingGlowPercent);

    heading.textContent =
        titles?.[definition.key] ||
        defaultTitles[definition.key] ||
        definition.key;

    section.appendChild(
        heading);


    const entriesContainer =
        document.createElement(
            "div");

    const useCompactLayout =
        definition.compactWhenProfileHidden &&
        profileImageVisibility[
            definition.key] === false;

    entriesContainer.className =
        useCompactLayout
            ? "credits-entry-list credits-entry-list-compact"
            : "credits-entry-list";

    if (columnCount === 2)
    {
        entriesContainer.classList.add(
            "credits-entry-list-two-column");
    }

    entriesContainer.style.setProperty(
        "--credits-column-count",
        String(
            columnCount));

    for (const entry of matchingEntries)
    {
        const card =
            createCreditEntryCard(
                definition,
                entry,
                nameColour,
                headingColour,
                profileImageVisibility[
                    definition.key] !== false);

        if (!card)
        {
            continue;
        }

        entriesContainer.appendChild(
            card);
    }


    if (entriesContainer.children.length === 0)
    {
        return null;
    }

    section.appendChild(
        entriesContainer);

    return section;
}

function stopCreditsRoll()
{
    if (rollAnimationFrame !== null)
    {
        cancelAnimationFrame(
            rollAnimationFrame);

        rollAnimationFrame =
            null;
    }

    rollLastTimestamp =
        null;
}


function getConfiguredCanvas(
    configuration)
{
    const width =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.canvasWidthPixels);

    const height =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.canvasHeightPixels);

    const key =
        `${width}x${height}`;

    if (![
            "1920x1080",
            "1600x900",
            "1280x720",
            "960x540"
        ].includes(
            key))
    {
        return {
            width:
                DEFAULT_CANVAS_WIDTH,

            height:
                DEFAULT_CANVAS_HEIGHT
        };
    }

    return {
        width,
        height
    };
}


function resizeCreditsCanvas()
{
    if (!canvas)
    {
        return;
    }

    const viewportWidth =
        Math.max(
            window.innerWidth,
            document.documentElement.clientWidth,
            1);

    const viewportHeight =
        Math.max(
            window.innerHeight,
            document.documentElement.clientHeight,
            1);

    const widthScale =
        viewportWidth /
        Math.max(
            canvasWidthPixels,
            1);

    const heightScale =
        viewportHeight /
        Math.max(
            canvasHeightPixels,
            1);

    canvasScale =
        Math.max(
            0.01,
            Math.min(
                widthScale,
                heightScale));

    canvas.style.width =
        `${canvasWidthPixels}px`;

    canvas.style.height =
        `${canvasHeightPixels}px`;

    canvas.style.transform =
        `scale(${canvasScale})`;
}


function getConfiguredContentScale(
    configuration)
{
    if (previewMode)
    {
        const previewScale =
            Number(
                previewParameters.get(
                    "scale"));

        if (Number.isFinite(
                previewScale))
        {
            return Math.min(
                2,
                Math.max(
                    0.5,
                    previewScale /
                    100));
        }
    }

    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.contentScalePercent);

    const percent =
        Number.isFinite(
            configured)
            ? Math.min(
                200,
                Math.max(
                    50,
                    configured))
            : 100;

    return percent /
        100;
}


function applyCreditsContentScale(
    configuration)
{
    contentScale =
        getConfiguredContentScale(
            configuration);

    if (!scaleShell)
    {
        return;
    }

    const logicalWidth =
        canvasWidthPixels /
        Math.max(
            contentScale,
            0.5);

    const logicalHeight =
        canvasHeightPixels /
        Math.max(
            contentScale,
            0.5);

    scaleShell.style.width =
        `${logicalWidth}px`;

    scaleShell.style.height =
        `${logicalHeight}px`;

    scaleShell.style.transform =
        `translate(-50%, -50%) scale(${contentScale})`;
}

function applyCreditsCanvas(
    configuration)
{
    const configuredCanvas =
        getConfiguredCanvas(
            configuration);

    canvasWidthPixels =
        configuredCanvas.width;

    canvasHeightPixels =
        configuredCanvas.height;

    resizeCreditsCanvas();
}


function getCreditsViewportHeight()
{
    if (scaleShell)
    {
        return Math.max(
            scaleShell.clientHeight,
            1);
    }

    return Math.max(
        canvasHeightPixels /
            Math.max(
                contentScale,
                0.5),
        1);
}


function getConfiguredCreditsLayout(
    configuration)
{
    if (previewMode)
    {
        const previewLayout =
            previewParameters.get(
                "layout");

        if (
            previewLayout &&
            SUPPORTED_CREDITS_LAYOUTS.includes(
                previewLayout)
        )
        {
            return previewLayout;
        }
    }

    const configured =
        (
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.layout
            ?? "ClassicRoll"
        ).toString();

    return SUPPORTED_CREDITS_LAYOUTS.includes(
        configured)
            ? configured
            : "ClassicRoll";
}


function getConfiguredSectionDisplaySeconds(
    configuration)
{
    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.sectionDisplaySeconds);

    if (!Number.isFinite(
            configured))
    {
        return 6;
    }

    return Math.min(
        30,
        Math.max(
            2,
            configured));
}


function getConfiguredTransitionDuration(
    configuration)
{
    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.transitionDurationMilliseconds);

    if (!Number.isFinite(
            configured))
    {
        return 700;
    }

    return Math.min(
        2000,
        Math.max(
            150,
            configured));
}


function getConfiguredFlyingAnimationStyle(
    configuration)
{
    const configured =
        (
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.flyingAnimationStyle
            ?? "Mixed"
        ).toString();

    return SUPPORTED_FLYING_STYLES.includes(
        configured)
            ? configured
            : "Mixed";
}


function getConfiguredPerspectiveStrength(
    configuration)
{
    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.perspectiveStrengthPercent);

    if (!Number.isFinite(
            configured))
    {
        return 65;
    }

    return Math.min(
        90,
        Math.max(
            30,
            configured));
}


function getConfiguredRetroPalette(
    configuration)
{
    if (previewMode)
    {
        const previewPalette =
            previewParameters.get(
                "retroPalette");

        if (
            previewPalette &&
            SUPPORTED_RETRO_PALETTES.includes(
                previewPalette)
        )
        {
            return previewPalette;
        }
    }

    const configured =
        (
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.retroPalette
            ?? "NeonArcade"
        ).toString();

    return SUPPORTED_RETRO_PALETTES.includes(
        configured)
            ? configured
            : "NeonArcade";
}


function getConfiguredRetroPanelOpacity(
    configuration)
{
    if (previewMode)
    {
        const previewValue =
            previewParameters.get(
                "retroOpacity");

        if (
            previewValue !== null &&
            previewValue !== ""
        )
        {
            const previewOpacity =
                Number(
                    previewValue);

            if (Number.isFinite(
                    previewOpacity))
            {
                return Math.min(
                    90,
                    Math.max(
                        35,
                        previewOpacity));
            }
        }
    }

    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.retroPanelOpacityPercent);

    if (!Number.isFinite(
            configured))
    {
        return 72;
    }

    return Math.min(
        90,
        Math.max(
            35,
            configured));
}



function getConfiguredTerminalTheme(
    configuration)
{
    if (previewMode)
    {
        const previewTheme =
            previewParameters.get(
                "terminalTheme");

        if (
            previewTheme &&
            Object.prototype.hasOwnProperty.call(
                TERMINAL_THEME_DEFINITIONS,
                previewTheme)
        )
        {
            return previewTheme;
        }
    }

    const configured =
        (
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.terminalTheme
            ?? "GreenCrt"
        ).toString();

    return Object.prototype.hasOwnProperty.call(
        TERMINAL_THEME_DEFINITIONS,
        configured)
            ? configured
            : "GreenCrt";
}


function getConfiguredTerminalBackgroundOpacity(
    configuration)
{
    if (previewMode)
    {
        const previewValue =
            Number(
                previewParameters.get(
                    "terminalOpacity"));

        if (Number.isFinite(
                previewValue))
        {
            return Math.min(
                100,
                Math.max(
                    0,
                    previewValue));
        }
    }

    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.terminalBackgroundOpacityPercent);

    if (!Number.isFinite(
            configured))
    {
        return 92;
    }

    return Math.min(
        100,
        Math.max(
            0,
            configured));
}


function getConfiguredTerminalTypingMilliseconds(
    configuration)
{
    if (previewMode)
    {
        const previewValue =
            Number(
                previewParameters.get(
                    "terminalTyping"));

        if (Number.isFinite(
                previewValue))
        {
            return Math.min(
                120,
                Math.max(
                    15,
                    previewValue));
        }
    }

    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.terminalTypingMilliseconds);

    if (!Number.isFinite(
            configured))
    {
        return 35;
    }

    return Math.min(
        120,
        Math.max(
            15,
            configured));
}




function getCreditsLayoutClassName(
    layout)
{
    switch (layout)
    {
        case "PerspectiveCrawl":
            return "layout-perspective-crawl";

        case "FlyingCredits":
            return "layout-flying-credits";

        case "CreditCards":
            return "layout-credit-cards";

        case "Spotlight":
            return "layout-spotlight";

        case "RetroArcade":
            return "layout-retro-arcade";

        case "Terminal":
            return "layout-terminal";

        default:
            return "layout-classic-roll";
    }
}


function applyCreditsLayout(
    configuration)
{
    creditsLayout =
        getConfiguredCreditsLayout(
            configuration);

    sectionDisplaySeconds =
        getConfiguredSectionDisplaySeconds(
            configuration);

    transitionDurationMilliseconds =
        getConfiguredTransitionDuration(
            configuration);

    flyingAnimationStyle =
        getConfiguredFlyingAnimationStyle(
            configuration);

    perspectiveStrengthPercent =
        getConfiguredPerspectiveStrength(
            configuration);

    retroPalette =
        getConfiguredRetroPalette(
            configuration);

    retroPanelOpacityPercent =
        getConfiguredRetroPanelOpacity(
            configuration);

    terminalTheme =
        getConfiguredTerminalTheme(
            configuration);

    terminalBackgroundOpacityPercent =
        getConfiguredTerminalBackgroundOpacity(
            configuration);

    terminalTypingMilliseconds =
        getConfiguredTerminalTypingMilliseconds(
            configuration);

    for (const className of
         [
             "layout-classic-roll",
             "layout-perspective-crawl",
             "layout-flying-credits",
             "layout-credit-cards",
             "layout-spotlight",
             "layout-retro-arcade",
             "layout-terminal"
         ])
    {
        canvas.classList.remove(
            className);
    }

    canvas.classList.add(
        getCreditsLayoutClassName(
            creditsLayout));

    canvas.style.setProperty(
        "--credits-transition-ms",
        `${transitionDurationMilliseconds}ms`);

    applyRetroArcadeTheme();
    applyTerminalTheme();
}


function applyOpacityToRgba(
    colour,
    opacityPercent)
{
    const match =
        String(
            colour ||
            "")
            .match(
                /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/i);

    if (!match)
    {
        return colour;
    }

    const parsedOpacity =
        Number(
            opacityPercent);

    const safeOpacity =
        Number.isFinite(
            parsedOpacity)
            ? Math.min(
                100,
                Math.max(
                    0,
                    parsedOpacity))
            : 92;

    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${safeOpacity / 100})`;
}


function applyTerminalTheme()
{
    const theme =
        TERMINAL_THEME_DEFINITIONS[
            terminalTheme
        ]
        ?? TERMINAL_THEME_DEFINITIONS
            .GreenCrt;

    canvas.style.setProperty(
        "--terminal-background",
        applyOpacityToRgba(
            theme.background,
            terminalBackgroundOpacityPercent));

    canvas.style.setProperty(
        "--terminal-panel",
        applyOpacityToRgba(
            theme.panel,
            terminalBackgroundOpacityPercent));

    canvas.style.setProperty(
        "--terminal-text",
        theme.text);

    canvas.style.setProperty(
        "--terminal-prompt",
        theme.prompt);

    canvas.style.setProperty(
        "--terminal-heading",
        theme.heading);

    canvas.style.setProperty(
        "--terminal-muted",
        theme.muted);

    canvas.style.setProperty(
        "--terminal-border",
        theme.border);

    canvas.style.setProperty(
        "--terminal-glow",
        theme.glow);

    canvas.style.setProperty(
        "--terminal-scanline",
        theme.scanline);
}


function applyRetroArcadeTheme()
{
    const palette =
        RETRO_PALETTE_DEFINITIONS[
            retroPalette
        ]
        ?? RETRO_PALETTE_DEFINITIONS
            .NeonArcade;

    const panelOpacity =
        Math.min(
            90,
            Math.max(
                35,
                retroPanelOpacityPercent)) /
        100;

    const cardOpacity =
        Math.min(
            0.96,
            panelOpacity +
            0.12);

    const panelBackground =
        `linear-gradient(135deg, ${palette.overlayStart}, ${palette.overlayEnd}), ` +
        `rgba(${palette.panelRgb}, ${panelOpacity.toFixed(3)})`;

    const cardBackground =
        `linear-gradient(90deg, ${palette.overlayStart}, transparent 68%), ` +
        `rgba(${palette.cardRgb}, ${cardOpacity.toFixed(3)})`;

    canvas.style.setProperty(
        "--retro-panel-background",
        panelBackground);

    canvas.style.setProperty(
        "--retro-card-background",
        cardBackground);

    canvas.style.setProperty(
        "--retro-border-colour",
        palette.borderColour);

    canvas.style.setProperty(
        "--retro-card-border-colour",
        palette.cardBorderColour);

    canvas.style.setProperty(
        "--retro-scanline-colour",
        palette.scanlineColour);

    canvas.style.setProperty(
        "--retro-shadow-colour",
        palette.shadowColour);

    canvas.style.setProperty(
        "--retro-glow-colour",
        palette.glowColour);
}



function stopCreditsSequence()
{
    if (sequenceTimer !== null)
    {
        clearTimeout(
            sequenceTimer);

        sequenceTimer =
            null;
    }

    if (sequenceTransitionTimer !== null)
    {
        clearTimeout(
            sequenceTransitionTimer);

        sequenceTransitionTimer =
            null;
    }
}


function clearSequencePresentation()
{
    const items =
        content.querySelectorAll(
            ".credits-sequence-active, .credits-sequence-exit");

    for (const item of items)
    {
        item.classList.remove(
            "credits-sequence-active",
            "credits-sequence-exit");
    }

    // Every prepared card receives this inline delay. Query only those cards
    // instead of walking every credits entry on every section change.
    const cards =
        content.querySelectorAll(
            ".credits-entry-card[style*='--credits-entry-delay']");

    for (const card of cards)
    {
        card.classList.remove(
            "credits-motion-slide-left",
            "credits-motion-slide-right",
            "credits-motion-drop",
            "credits-motion-rise",
            "credits-motion-swing",
            "credits-motion-pop");

        card.style.removeProperty(
            "--credits-entry-delay");
    }
}

function clearPerspectivePresentation()
{
    const items =
        content.querySelectorAll(
            ".credits-section, .credits-logo");

    for (const item of items)
    {
        item.style.removeProperty(
            "transform");

        item.style.removeProperty(
            "opacity");

        item.style.removeProperty(
            "transform-origin");
    }
}


function restartCreditsRoll()
{
    stopCreditsRoll();
    stopCreditsSequence();
    stopTerminalPresentation();
    clearSequencePresentation();
    clearPerspectivePresentation();

    content.style.transform =
        "";

    if (content.classList.contains(
            "credits-empty") ||
        rollLimitReached)
    {
        return;
    }

    content.style.visibility =
        "";

    if (creditsLayout ===
        "Terminal")
    {
        startTerminalPresentation();

        return;
    }

    if (
        creditsLayout ===
            "FlyingCredits" ||
        creditsLayout ===
            "CreditCards" ||
        creditsLayout ===
            "Spotlight" ||
        creditsLayout ===
            "RetroArcade"
    )
    {
        startCreditsSequence();

        return;
    }

    rollPositionY =
        getCreditsViewportHeight();

    content.style.transform =
        `translate3d(0, ${rollPositionY}px, 0)`;

    if (creditsLayout ===
        "PerspectiveCrawl")
    {
        applyPerspectiveCrawlStyles();
    }

    rollAnimationFrame =
        requestAnimationFrame(
            animateCreditsRoll);
}


function animateCreditsRoll(
    timestamp)
{
    if (rollLastTimestamp === null)
    {
        rollLastTimestamp =
            timestamp;
    }

    const elapsedSeconds =
        Math.max(
            0,
            timestamp - rollLastTimestamp) /
        1000;

    rollLastTimestamp =
        timestamp;

    const logicalScrollSpeed =
        scrollSpeedPixelsPerSecond /
        Math.max(
            canvasScale *
                contentScale,
            0.01);

    rollPositionY -=
        logicalScrollSpeed *
        elapsedSeconds;

    const contentHeight =
        Math.max(
            content.scrollHeight,
            content.offsetHeight,
            1);

    if (rollPositionY <=
        -contentHeight)
    {
        completedCycles++;

        if (
            maximumCycles > 0 &&
            completedCycles >=
                maximumCycles)
        {
            rollLimitReached =
                true;

            content.style.visibility =
                "hidden";

            content.style.transform =
                "";

            stopCreditsRoll();

            return;
        }

        rollPositionY =
            getCreditsViewportHeight();
    }

    content.style.transform =
        `translate3d(0, ${rollPositionY}px, 0)`;

    if (creditsLayout ===
        "PerspectiveCrawl")
    {
        applyPerspectiveCrawlStyles();
    }

    rollAnimationFrame =
        requestAnimationFrame(
            animateCreditsRoll);
}


function applyPerspectiveCrawlStyles()
{
    const viewportHeight =
        Math.max(
            getCreditsViewportHeight(),
            1);

    const strength =
        perspectiveStrengthPercent /
        100;

    const minimumScale =
        0.28 +
        (
            (1 - strength) *
            0.18
        );

    const maximumScale =
        1.06 +
        (
            strength *
            0.34
        );

    const tiltDegrees =
        14 +
        (
            strength *
            16
        );

    const fadeDistance =
        viewportHeight *
        (
            0.14 +
            (
                strength *
                0.08
            )
        );

    const items =
        content.querySelectorAll(
            ".credits-section, .credits-logo");

    for (const item of items)
    {
        const logicalCentre =
            rollPositionY +
            item.offsetTop +
            (
                item.offsetHeight /
                2
            );

        const verticalRatio =
            Math.max(
                0,
                Math.min(
                    1,
                    logicalCentre /
                    viewportHeight));

        const scale =
            minimumScale +
            (
                verticalRatio *
                (
                    maximumScale -
                    minimumScale
                )
            );

        let opacity =
            1;

        if (logicalCentre <= 0)
        {
            opacity =
                0;
        }
        else if (
            logicalCentre <
            fadeDistance)
        {
            opacity =
                logicalCentre /
                Math.max(
                    fadeDistance,
                    1);
        }

        item.style.transformOrigin =
            "center center";

        item.style.transform =
            `perspective(1100px) rotateX(${tiltDegrees}deg) scale(${scale})`;

        item.style.opacity =
            String(
                Math.max(
                    0,
                    Math.min(
                        1,
                        opacity)));
    }
}


function getCreditsSequenceItems()
{
    return Array.from(
        content.children)
        .filter(
            item =>
                item.classList.contains(
                    "credits-section") ||
                item.classList.contains(
                    "credits-logo"));
}


function startCreditsSequence()
{
    const items =
        getCreditsSequenceItems();

    if (items.length === 0)
    {
        return;
    }

    sequenceIndex =
        0;

    showCreditsSequenceItem(
        items,
        sequenceIndex);
}


function showCreditsSequenceItem(
    items,
    index)
{
    if (
        rollLimitReached ||
        items.length === 0)
    {
        return;
    }

    clearSequencePresentation();

    sequenceIndex =
        index;

    const item =
        items[
            sequenceIndex
        ];

    prepareCreditsSequenceItem(
        item);

    requestAnimationFrame(
        () =>
        {
            item.classList.add(
                "credits-sequence-active");
        });

    sequenceTimer =
        setTimeout(
            () =>
            {
                item.classList.add(
                    "credits-sequence-exit");

                sequenceTransitionTimer =
                    setTimeout(
                        () =>
                        {
                            item.classList.remove(
                                "credits-sequence-active",
                                "credits-sequence-exit");

                            let nextIndex =
                                sequenceIndex +
                                1;

                            if (nextIndex >=
                                items.length)
                            {
                                completedCycles++;

                                if (
                                    maximumCycles > 0 &&
                                    completedCycles >=
                                        maximumCycles)
                                {
                                    rollLimitReached =
                                        true;

                                    content.style.visibility =
                                        "hidden";

                                    stopCreditsSequence();

                                    return;
                                }

                                nextIndex =
                                    0;
                            }

                            showCreditsSequenceItem(
                                items,
                                nextIndex);
                        },
                        transitionDurationMilliseconds);
            },
            sectionDisplaySeconds *
            1000);
}


function prepareCreditsSequenceItem(
    item)
{
    const cards =
        Array.from(
            item.querySelectorAll(
                ".credits-entry-card"));

    for (
        let index = 0;
        index < cards.length;
        index++
    )
    {
        const card =
            cards[index];

        const delay =
            Math.min(
                index,
                12) *
            105;

        card.style.setProperty(
            "--credits-entry-delay",
            `${delay}ms`);

        if (creditsLayout !==
            "FlyingCredits")
        {
            continue;
        }

        const motion =
            chooseFlyingMotion(
                index);

        card.classList.add(
            `credits-motion-${motion}`);
    }
}


function chooseFlyingMotion(
    index)
{
    if (flyingAnimationStyle ===
        "Slide")
    {
        return index % 2 === 0
            ? "slide-left"
            : "slide-right";
    }

    if (flyingAnimationStyle ===
        "Swing")
    {
        return "swing";
    }

    if (flyingAnimationStyle ===
        "Drop")
    {
        return "drop";
    }

    if (flyingAnimationStyle ===
        "Pop")
    {
        return "pop";
    }

    const mixedMotions =
        [
            "slide-left",
            "slide-right",
            "drop",
            "rise",
            "swing",
            "pop"
        ];

    const randomIndex =
        Math.floor(
            Math.random() *
            mixedMotions.length);

    return mixedMotions[
        randomIndex
    ];
}

function stopTerminalPresentation()
{
    terminalRunToken++;

    if (terminalTimer !== null)
    {
        clearTimeout(
            terminalTimer);

        terminalTimer =
            null;
    }

    const shell =
        content.querySelector(
            ".credits-terminal-shell");

    shell?.remove();
}


function getTerminalSections()
{
    const sections =
        Array.from(
            content.querySelectorAll(
                ".credits-section"));

    return sections
        .map(
            section =>
            {
                const heading =
                    (
                        section.querySelector(
                            ".credits-heading")
                            ?.textContent
                        ?? ""
                    ).trim();

                const names =
                    Array.from(
                        section.querySelectorAll(
                            ".credits-entry-card"))
                        .map(
                            card =>
                            {
                                const name =
                                    (
                                        card.querySelector(
                                            ".credits-entry-name")
                                            ?.textContent
                                        ?? ""
                                    ).trim();

                                const detail =
                                    (
                                        card.dataset
                                            .terminalDetail
                                        ?? ""
                                    ).trim();

                                if (!name)
                                {
                                    return "";
                                }

                                return detail
                                    ? `${name} [${detail}]`
                                    : name;
                            })
                        .filter(
                            Boolean);

                return {
                    heading,
                    names
                };
            })
        .filter(
            section =>
                section.heading &&
                section.names.length > 0);
}


function createTerminalShell()
{
    const shell =
        document.createElement(
            "div");

    shell.className =
        "credits-terminal-shell";

    const titleBar =
        document.createElement(
            "div");

    titleBar.className =
        "credits-terminal-titlebar";

    const lights =
        document.createElement(
            "div");

    lights.className =
        "credits-terminal-lights";

    for (
        let index = 0;
        index < 3;
        index++
    )
    {
        const light =
            document.createElement(
                "span");

        lights.appendChild(
            light);
    }

    const title =
        document.createElement(
            "div");

    title.className =
        "credits-terminal-title";

    title.textContent =
        "OMSC STREAM CREDITS — LOCAL CONSOLE";

    titleBar.appendChild(
        lights);

    titleBar.appendChild(
        title);

    const output =
        document.createElement(
            "div");

    output.className =
        "credits-terminal-output";

    shell.appendChild(
        titleBar);

    shell.appendChild(
        output);

    content.appendChild(
        shell);

    return output;
}


function scheduleTerminal(
    callback,
    milliseconds,
    runToken)
{
    terminalTimer =
        setTimeout(
            () =>
            {
                terminalTimer =
                    null;

                if (runToken !==
                    terminalRunToken)
                {
                    return;
                }

                callback();
            },
            Math.max(
                0,
                milliseconds));
}


function typeTerminalLine(
    output,
    text,
    className,
    prefix,
    runToken,
    onComplete)
{
    if (runToken !==
        terminalRunToken)
    {
        return;
    }

    const line =
        document.createElement(
            "div");

    line.className =
        `credits-terminal-line ${className}`;

    if (prefix)
    {
        const prefixElement =
            document.createElement(
                "span");

        prefixElement.className =
            "credits-terminal-prefix";

        prefixElement.textContent =
            prefix;

        line.appendChild(
            prefixElement);
    }

    const typed =
        document.createElement(
            "span");

    typed.className =
        "credits-terminal-typed";

    line.appendChild(
        typed);

    const cursor =
        document.createElement(
            "span");

    cursor.className =
        "credits-terminal-cursor";

    cursor.textContent =
        "█";

    line.appendChild(
        cursor);

    output.appendChild(
        line);

    let index =
        0;

    const typeNext =
        () =>
        {
            if (runToken !==
                terminalRunToken)
            {
                return;
            }

            if (index >=
                text.length)
            {
                cursor.remove();

                scheduleTerminal(
                    onComplete,
                    110,
                    runToken);

                return;
            }

            typed.textContent +=
                text[index];

            index++;

            output.scrollTop =
                output.scrollHeight;

            scheduleTerminal(
                typeNext,
                terminalTypingMilliseconds,
                runToken);
        };

    typeNext();
}


function typeTerminalNames(
    output,
    names,
    index,
    runToken,
    onComplete)
{
    if (runToken !==
        terminalRunToken)
    {
        return;
    }

    if (index >=
        names.length)
    {
        onComplete();

        return;
    }

    typeTerminalLine(
        output,
        names[index],
        "credits-terminal-name",
        "",
        runToken,
        () =>
        {
            typeTerminalNames(
                output,
                names,
                index + 1,
                runToken,
                onComplete);
        });
}


function startTerminalPresentation()
{
    const sections =
        getTerminalSections();

    if (sections.length === 0)
    {
        return;
    }

    const output =
        createTerminalShell();

    terminalRunToken++;

    const runToken =
        terminalRunToken;

    runTerminalSection(
        output,
        sections,
        0,
        runToken);
}


function runTerminalSection(
    output,
    sections,
    sectionIndex,
    runToken)
{
    if (runToken !==
        terminalRunToken)
    {
        return;
    }

    output.replaceChildren();

    const section =
        sections[
            sectionIndex
        ];

    typeTerminalLine(
        output,
        `show "${section.heading}"`,
        "credits-terminal-command",
        "omsc@credits:~$ ",
        runToken,
        () =>
        {
            typeTerminalLine(
                output,
                `[ ${section.heading.toUpperCase()} ]`,
                "credits-terminal-heading",
                "",
                runToken,
                () =>
                {
                    typeTerminalNames(
                        output,
                        section.names,
                        0,
                        runToken,
                        () =>
                        {
                            scheduleTerminal(
                                () =>
                                {
                                    typeTerminalLine(
                                        output,
                                        "clear",
                                        "credits-terminal-command credits-terminal-clear",
                                        "omsc@credits:~$ ",
                                        runToken,
                                        () =>
                                        {
                                            scheduleTerminal(
                                                () =>
                                                {
                                                    let nextIndex =
                                                        sectionIndex +
                                                        1;

                                                    if (nextIndex >=
                                                        sections.length)
                                                    {
                                                        completedCycles++;

                                                        if (
                                                            maximumCycles > 0 &&
                                                            completedCycles >=
                                                                maximumCycles
                                                        )
                                                        {
                                                            rollLimitReached =
                                                                true;

                                                            content.style.visibility =
                                                                "hidden";

                                                            stopTerminalPresentation();

                                                            return;
                                                        }

                                                        nextIndex =
                                                            0;
                                                    }

                                                    runTerminalSection(
                                                        output,
                                                        sections,
                                                        nextIndex,
                                                        runToken);
                                                },
                                                transitionDurationMilliseconds,
                                                runToken);
                                        });
                                },
                                sectionDisplaySeconds *
                                1000,
                                runToken);
                        });
                });
        });
}




function getConfiguredScrollSpeed(
    configuration)
{
    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.scrollSpeedPixelsPerSecond);

    if (!Number.isFinite(
            configured))
    {
        return DEFAULT_SCROLL_SPEED_PX_PER_SECOND;
    }

    return Math.min(
        MAX_SCROLL_SPEED_PX_PER_SECOND,
        Math.max(
            MIN_SCROLL_SPEED_PX_PER_SECOND,
            configured));
}


function getConfiguredMaximumCycles(
    configuration)
{
    const configured =
        Number(
            configuration?.settings
                ?.widgets
                ?.streamCredits
                ?.maximumCycles);

    if (!Number.isInteger(
            configured) ||
        configured < 0)
    {
        return 0;
    }

    return configured;
}

function getEventVisibility(
    configuration)
{
    const events =
        configuration?.settings
            ?.streamCredits
            ?.events
        ?? {};

    return {
        chatters:
            events.chattersEnabled !== false,

        firstTimeChatters:
            events.firstTimeChattersEnabled !== false,

        moderators:
            events.moderatorsEnabled !== false,

        bits:
            events.bitsEnabled !== false,

        follows:
            events.followsEnabled !== false,

        subscribers:
            events.subscribersEnabled !== false,

        resubscribers:
            events.resubscribersEnabled !== false,

        giftedSubscriptions:
            events.giftedSubscriptionsEnabled !== false,

        raids:
            events.raidsEnabled !== false,

        watchStreaks:
            events.watchStreaksEnabled !== false
    };
}

function getProfileImageVisibility(
    appearance)
{
    const profileImages =
        appearance?.profileImages
        ?? {};

    const legacyShowProfileImages =
        typeof appearance?.showProfileImages ===
            "boolean"
            ? appearance.showProfileImages
            : true;

    return {
        chatters:
            profileImages.chatters === undefined
                ? false
                : profileImages.chatters !== false,

        firstTimeChatters:
            profileImages.firstTimeChatters === undefined
                ? false
                : profileImages.firstTimeChatters !== false,

        moderators:
            profileImages.moderators === undefined
                ? false
                : profileImages.moderators !== false,

        bits:
            profileImages.bits === undefined
                ? legacyShowProfileImages
                : profileImages.bits !== false,

        follows:
            profileImages.follows === undefined
                ? legacyShowProfileImages
                : profileImages.follows !== false,

        subscribers:
            profileImages.subscribers === undefined
                ? legacyShowProfileImages
                : profileImages.subscribers !== false,

        resubscribers:
            profileImages.resubscribers === undefined
                ? legacyShowProfileImages
                : profileImages.resubscribers !== false,

        giftedSubscriptions:
            profileImages.giftedSubscriptions === undefined
                ? legacyShowProfileImages
                : profileImages.giftedSubscriptions !== false,

        raids:
            profileImages.raids === undefined
                ? legacyShowProfileImages
                : profileImages.raids !== false,

        watchStreaks:
            profileImages.watchStreaks === undefined
                ? legacyShowProfileImages
                : profileImages.watchStreaks !== false
    };
}


function createRenderSignature(
    session,
    configuration,
    assetState)
{
    const appearance =
        configuration?.settings
            ?.streamCredits
            ?.appearance
        ?? {};

    return JSON.stringify(
        {
            entries:
                getDisplayEntries(
                    session,
                    configuration),

            sectionTitles:
                appearance.sectionTitles
                ?? {},

            headingColour:
                appearance.headingColour
                ?? "#FFFFFF",

            nameColour:
                appearance.nameColour
                ?? "#FFFFFF",

            headingGlowPercent:
                appearance.headingGlowPercent
                ?? 0,

            profileImageVisibility:
                getProfileImageVisibility(
                    appearance),

            columnCount:
                [1, 2].includes(
                    Number(
                        appearance.columnCount))
                    ? Number(
                        appearance.columnCount)
                    : 2,

            sectionOrder:
                appearance.sectionOrder
                ?? defaultSectionOrder,

            canvas:
                getConfiguredCanvas(
                    configuration),

            contentScale:
                getConfiguredContentScale(
                    configuration),

            layout:
                getConfiguredCreditsLayout(
                    configuration),

            scrollSpeedPixelsPerSecond:
                getConfiguredScrollSpeed(
                    configuration),

            maximumCycles:
                getConfiguredMaximumCycles(
                    configuration),

            sectionDisplaySeconds:
                getConfiguredSectionDisplaySeconds(
                    configuration),

            transitionDurationMilliseconds:
                getConfiguredTransitionDuration(
                    configuration),

            flyingAnimationStyle:
                getConfiguredFlyingAnimationStyle(
                    configuration),

            perspectiveStrengthPercent:
                getConfiguredPerspectiveStrength(
                    configuration),

            retroPalette:
                getConfiguredRetroPalette(
                    configuration),

            retroPanelOpacityPercent:
                getConfiguredRetroPanelOpacity(
                    configuration),

            terminalTheme:
                getConfiguredTerminalTheme(
                    configuration),

            terminalTypingMilliseconds:
                getConfiguredTerminalTypingMilliseconds(
                    configuration),

            eventVisibility:
                getEventVisibility(
                    configuration),

            logoImageUrl:
                assetState?.logoImageUrl
                ?? ""
        });
}


function disableLiveCreditsWidget()
{
    stopCreditsRoll();
    stopCreditsSequence();
    stopTerminalPresentation();

    clearSequencePresentation();
    clearPerspectivePresentation();

    content.style.transform =
        "";

    content.style.visibility =
        "hidden";

    content.replaceChildren();

    content.classList.add(
        "credits-empty");

    currentRenderSignature =
        "module-disabled";
}


function renderCredits(
    session,
    configuration,
    assetState)
{
    applyCreditsCanvas(
        configuration);

    applyCreditsContentScale(
        configuration);

    applyCreditsLayout(
        configuration);

    scrollSpeedPixelsPerSecond =
        getConfiguredScrollSpeed(
            configuration);

    maximumCycles =
        getConfiguredMaximumCycles(
            configuration);

    completedCycles =
        0;

    rollLimitReached =
        false;

    content.style.visibility =
        "";

    const entries =
        getDisplayEntries(
            session,
            configuration);

    const appearance =
        configuration?.settings
            ?.streamCredits
            ?.appearance
        ?? {};

    const titles =
        appearance.sectionTitles
        ?? {};

    const headingColour =
        appearance.headingColour
        ?? "#FFFFFF";

    const nameColour =
        appearance.nameColour
        ?? "#FFFFFF";

    const headingGlowPercent =
        Number(
            appearance.headingGlowPercent)
        || 0;

    const profileImageVisibility =
        getProfileImageVisibility(
            appearance);

    const configuredColumnCount =
        Number(
            appearance.columnCount);

    const columnCount =
        [1, 2].includes(
            configuredColumnCount)
            ? configuredColumnCount
            : 2;

    const eventVisibility =
        getEventVisibility(
            configuration);

    const orderedSectionDefinitions =
        getOrderedSectionDefinitions(
            appearance.sectionOrder);

    const fragment =
        document.createDocumentFragment();

    let contentCount =
        0;

    const logo =
        createLogo(
            assetState);

    if (logo)
    {
        fragment.appendChild(
            logo);

        contentCount++;
    }

    for (const definition of
         orderedSectionDefinitions)
    {
        if (
            eventVisibility[
                definition.key
            ] === false)
        {
            continue;
        }

        const section =
            createSection(
                definition,
                entries,
                titles,
                headingColour,
                nameColour,
                headingGlowPercent,
                profileImageVisibility,
                columnCount);

        if (!section)
        {
            continue;
        }

        fragment.appendChild(
            section);

        contentCount++;
    }

    content.replaceChildren(
        fragment);

    content.classList.toggle(
        "credits-empty",
        contentCount === 0);

    restartCreditsRoll();
}

async function loadCredits()
{
    try
    {
        const configurationResponse =
            await fetch(
                CONFIGURATION_ENDPOINT,
                {
                    cache:
                        "no-store"
                });

        if (!configurationResponse.ok)
        {
            throw new Error(
                `Configuration HTTP ${configurationResponse.status}`);
        }

        const configuration =
            await configurationResponse.json();

        const configuredModuleEnabled =
            configuration?.settings
                ?.streamCredits
                ?.enabled !== false;

        creditsModuleEnabled =
            configuredModuleEnabled ||
            previewMode;

        if (!creditsModuleEnabled)
        {
            disableLiveCreditsWidget();

            return;
        }

        const [
            sessionResponse,
            assetStateResponse
        ] =
            await Promise.all(
                [
                    fetch(
                        SESSION_ENDPOINT,
                        {
                            cache:
                                "no-store"
                        }),

                    fetch(
                        ASSET_STATE_ENDPOINT,
                        {
                            cache:
                                "no-store"
                        })
                ]);

        if (!sessionResponse.ok)
        {
            throw new Error(
                `Stream Credits HTTP ${sessionResponse.status}`);
        }

        if (!assetStateResponse.ok)
        {
            throw new Error(
                `Stream Credits asset HTTP ${assetStateResponse.status}`);
        }

        const session =
            await sessionResponse.json();

        const assetState =
            await assetStateResponse.json();

        const renderSignature =
            createRenderSignature(
                session,
                configuration,
                assetState);

        if (renderSignature !==
            currentRenderSignature)
        {
            currentRenderSignature =
                renderSignature;

            renderCredits(
                session,
                configuration,
                assetState);
        }
    }
    catch
    {
        /*
            OBS browser sources should remain clean if OMSC is
            temporarily unavailable. The next poll will retry.
        */
    }
}
let creditsWidgetAssetMarker =
    "";


async function checkCreditsWidgetAssets()
{
    if (!creditsModuleEnabled &&
        !previewMode)
    {
        return;
    }

    try
    {
        const [
            javascriptResponse,
            stylesheetResponse
        ] =
            await Promise.all(
                [
                    fetch(
                        "/widget/credits/widget.js",
                        {
                            method:
                                "HEAD",

                            cache:
                                "no-store"
                        }),

                    fetch(
                        "/widget/credits/widget.css",
                        {
                            method:
                                "HEAD",

                            cache:
                                "no-store"
                        })
                ]);

        if (
            !javascriptResponse.ok ||
            !stylesheetResponse.ok
        )
        {
            return;
        }

        const marker =
            [
                javascriptResponse.headers.get(
                    "etag") ?? "",

                javascriptResponse.headers.get(
                    "last-modified") ?? "",

                stylesheetResponse.headers.get(
                    "etag") ?? "",

                stylesheetResponse.headers.get(
                    "last-modified") ?? ""
            ].join(
                "|");

        if (!creditsWidgetAssetMarker)
        {
            creditsWidgetAssetMarker =
                marker;

            return;
        }

        if (
            marker &&
            marker !==
                creditsWidgetAssetMarker
        )
        {
            window.location.reload();
        }
    }
    catch
    {
        /*
            OMSC may be restarting. The current credits remain
            visible and the next check retries automatically.
        */
    }
}


function handleCreditsResize()
{
    resizeCreditsCanvas();
    restartCreditsRoll();
}


window.addEventListener(
    "resize",
    handleCreditsResize);

loadCredits();

setInterval(
    loadCredits,
    POLL_INTERVAL_MS);

checkCreditsWidgetAssets();

setInterval(
    checkCreditsWidgetAssets,
    10000);