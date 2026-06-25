package com.example.buzzer.model;

public class BuzzRequest {
    private String playerName;

    public BuzzRequest() {}

    public BuzzRequest(String playerName) {
        this.playerName = playerName;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }
}
