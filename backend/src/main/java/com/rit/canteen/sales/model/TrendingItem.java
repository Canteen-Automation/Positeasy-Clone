package com.rit.canteen.sales.model;

public class TrendingItem {
    private String name;
    private String category;
    private long qty;
    private String image;

    public TrendingItem() {}

    public TrendingItem(String name, String category, long qty, String image) {
        this.name = name;
        this.category = category;
        this.qty = qty;
        this.image = image;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getQty() { return qty; }
    public void setQty(long qty) { this.qty = qty; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
