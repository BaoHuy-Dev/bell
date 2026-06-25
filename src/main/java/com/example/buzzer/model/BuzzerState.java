package com.example.buzzer.model;

public class BuzzerState {
    private String winner;

    public BuzzerState() {}

    public BuzzerState(String winner) {
        this.winner = winner;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }
}
