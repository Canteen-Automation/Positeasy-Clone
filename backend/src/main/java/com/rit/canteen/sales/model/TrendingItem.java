package com.rit.canteen.sales.model;

public class TrendingItem {
    private String name;
    private String category;
    private long orderCount;
    private String imageUrl;

    public TrendingItem() {}

    public TrendingItem(String name, String category, long orderCount, String imageUrl) {
        this.name = name;
        this.category = category;
        this.orderCount = orderCount;
        this.imageUrl = imageUrl;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
