package com.rit.canteen.sales.counter.service;

import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.model.OrderItem;
import com.rit.canteen.sales.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CounterOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CounterProductService productService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus("COMPLETED");
        }
        
        // Ensure bidirectional relationship for items
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
                // Update stock if product ID is present
                if (item.getProductId() != null) {
                    productService.updateStock(item.getProductId(), item.getQuantity());
                }
            }
        }
        
        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setItems(orderDetails.getItems());
        order.setTotalAmount(orderDetails.getTotalAmount());
        order.setStatus(orderDetails.getStatus());
        
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
