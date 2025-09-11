package com.kmrl.document.dto;

public class ChatRequest {
    private String question;
    private String language = "en";

    // Constructors
    public ChatRequest() {}

    public ChatRequest(String question, String language) {
        this.question = question;
        this.language = language;
    }

    // Getters and Setters
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
