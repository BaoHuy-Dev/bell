package com.example.buzzer.service;

import com.example.buzzer.model.BuzzerState;
import org.springframework.stereotype.Service;

@Service
public class BuzzerService {
    private String winner = null;

    /**
     * Synchronized method to ensure only the first request wins.
     * @param playerName the name of the player who buzzed
     * @return true if the player is the new winner, false if there is already a winner
     */
    public synchronized boolean buzz(String playerName) {
        if (this.winner == null) {
            this.winner = playerName;
            return true;
        }
        return false;
    }

    public synchronized void reset() {
        this.winner = null;
    }

    public synchronized BuzzerState getState() {
        return new BuzzerState(this.winner);
    }
}
