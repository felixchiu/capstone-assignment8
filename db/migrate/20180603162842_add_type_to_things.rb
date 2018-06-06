class AddTypeToThings < ActiveRecord::Migration
  def change
    add_reference :things, :type, index: true, foreign_key: true
  end
end
