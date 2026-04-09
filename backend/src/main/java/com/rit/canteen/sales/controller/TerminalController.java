package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.model.Terminal;
import com.rit.canteen.sales.model.TerminalDTO;
import com.rit.canteen.sales.service.TerminalService;
import com.rit.canteen.sales.repository.TerminalRepository;
import com.rit.canteen.sales.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/terminals")
public class TerminalController {

    @Autowired
    private TerminalService terminalService;

    @Autowired
    private TerminalRepository terminalRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<TerminalDTO> getAllTerminals() {
        return terminalService.getAllTerminals().stream()
            .map(t -> new TerminalDTO(
                t.getId(), 
                t.getName(), 
                t.getLocation(), 
                "********", 
                "****"
            ))
            .toList();
    }

    @PostMapping
    public ResponseEntity<Terminal> createTerminal(@RequestBody Terminal terminal) {
        Terminal created = terminalService.createTerminal(terminal);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/verify-pin")
    public ResponseEntity<?> verifyPinAndGetDetails(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String pin = request.get("pin");
        if (terminalService.verifyPin(id, pin)) {
            Optional<Terminal> terminal = terminalService.getTerminalById(id);
            return ResponseEntity.ok(terminal.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Security PIN"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerminal(@PathVariable Long id) {
        terminalService.deleteTerminal(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<?> getOrderForTerminal(
            @PathVariable String orderNumber,
            @RequestHeader("X-API-KEY") String apiKey) {
        
        // 1. Verify API Key
        Optional<Terminal> terminal = terminalRepository.findByApiKey(apiKey);
        if (terminal.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid API Key"));
        }

        // 2. Fetch Order
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            // Check if order is expired/archived
            if (order.isArchived()) {
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "This order has expired and cannot be processed."));
            }

            // Check if order is already fulfilled
            if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "This order has already been fulfilled and cannot be printed again."));
            }
            
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found"));
        }
    }
}
