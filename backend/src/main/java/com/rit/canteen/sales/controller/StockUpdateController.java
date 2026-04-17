package com.rit.canteen.sales.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/stock")
public class StockUpdateController {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStockUpdates() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        this.emitters.add(emitter);

        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError((e) -> this.emitters.remove(emitter));

        // Send initial heartbeat to keep connection alive
        try {
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data("Connection Established"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastStockUpdate(Long productId, Integer stock) {
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        Map<String, Object> payload = Map.of(
            "productId", productId,
            "stock", stock
        );

        this.emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("stockUpdate")
                        .data(payload));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        });

        this.emitters.removeAll(deadEmitters);
    }
}
