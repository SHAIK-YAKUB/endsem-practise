package com.klef.cicd.lab.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.cicd.lab.entity.FoodOrder;
import com.klef.cicd.lab.repository.FoodOrderRepository;

@Service
public class FoodOrderServiceImpl implements FoodOrderService {

    @Autowired
    private FoodOrderRepository repo;

    @Override
    public FoodOrder addOrder(FoodOrder order) {
        Optional<FoodOrder> existing = repo.findById(order.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Order with ID " + order.getId() + " already exists!");
        }
        order.setTotalCost(order.getPrice() * order.getQuantity());
        return repo.save(order);
    }

    @Override
    public List<FoodOrder> getAllOrders() {
        return repo.findAll();
    }

    @Override
    public FoodOrder getOrderById(int id) {
        Optional<FoodOrder> opt = repo.findById(id);
        return opt.orElse(null);
    }

    @Override
    public FoodOrder updateOrder(FoodOrder order) {
        Optional<FoodOrder> existing = repo.findById(order.getId());
        if (existing.isPresent()) {
            order.setTotalCost(order.getPrice() * order.getQuantity());
            return repo.save(order);
        } else {
            throw new RuntimeException("Order with ID " + order.getId() + " not found!");
        }
    }

    @Override
    public void deleteOrderById(int id) {
        repo.deleteById(id);
    }
}
