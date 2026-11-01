import { randomUUID } from "crypto";
import { mutateCollection, readCollection } from "./database.js";

export const MAX_PLAYS = 3;

function remainingFor(plays) {
    return Math.max(0, MAX_PLAYS - plays.length);
}

export function getPlaySummary(linkId) {
    const link = readCollection("links").find((item) => item.id === linkId);
    if (!link) return null;

    const plays = Array.isArray(link.plays) ? link.plays : [];
    return {
        count: plays.length,
        remaining: remainingFor(plays),
        plays,
    };
}

export function reservePlay(linkId, ip, reservationId) {
    return mutateCollection("links", (links) => {
        const index = links.findIndex((item) => item.id === linkId);
        if (index === -1) return { items: links, result: { status: "not-found" } };

        const link = links[index];
        const plays = Array.isArray(link.plays) ? link.plays : [];
        const existing = plays.find((play) => play.reservationId === reservationId);
        if (existing) {
            return {
                items: links,
                result: {
                    status: "reserved",
                    play: existing,
                    remaining: remainingFor(plays),
                },
            };
        }
        if (plays.length >= MAX_PLAYS) {
            return {
                items: links,
                result: { status: "maxed", remaining: 0 },
            };
        }

        const now = new Date().toISOString();
        const play = {
            id: randomUUID(),
            reservationId,
            ip,
            status: "in_progress",
            won: null,
            at: now,
            startedAt: now,
        };
        const updatedLink = { ...link, plays: [...plays, play] };
        const updatedLinks = [...links];
        updatedLinks[index] = updatedLink;

        return {
            items: updatedLinks,
            result: {
                status: "reserved",
                play,
                remaining: remainingFor(updatedLink.plays),
            },
        };
    });
}

export function finishPlay(linkId, playId, won) {
    return mutateCollection("links", (links) => {
        const index = links.findIndex((item) => item.id === linkId);
        if (index === -1) return { items: links, result: { status: "not-found" } };

        const link = links[index];
        const plays = Array.isArray(link.plays) ? link.plays : [];
        const playIndex = plays.findIndex((play) => play.id === playId);
        if (playIndex === -1) {
            return { items: links, result: { status: "play-not-found" } };
        }

        const play = plays[playIndex];
        if (play.status !== "in_progress") {
            return {
                items: links,
                result: {
                    status: "already-finished",
                    play,
                    remaining: remainingFor(plays),
                },
            };
        }

        const finishedPlay = {
            ...play,
            status: "finished",
            won: won === true,
            finishedAt: new Date().toISOString(),
        };
        const updatedPlays = [...plays];
        updatedPlays[playIndex] = finishedPlay;
        const updatedLinks = [...links];
        updatedLinks[index] = { ...link, plays: updatedPlays };

        return {
            items: updatedLinks,
            result: {
                status: "finished",
                play: finishedPlay,
                remaining: remainingFor(updatedPlays),
            },
        };
    });
}
