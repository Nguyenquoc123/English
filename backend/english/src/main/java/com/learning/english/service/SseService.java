package com.learning.english.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.learning.english.dto.response.NotificationSseResponse;



@Service
public class SseService {

    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);

        adminEmitters.add(emitter);

        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError((e) -> adminEmitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Admin SSE connected"));
        } catch (IOException e) {
            adminEmitters.remove(emitter);
        }

        return emitter;
    }

    public void sendWithdrawalPaid(NotificationSseResponse response) {
        sendToAdmins("PAID", response);
    }

    public void sendWithdrawalFailed(NotificationSseResponse response) {
        sendToAdmins("FAILED", response);
    }

    private void sendToAdmins(String eventName, Object data) {
        for (SseEmitter emitter : adminEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                adminEmitters.remove(emitter);
            }
        }
    }
}